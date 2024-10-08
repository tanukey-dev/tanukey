import { IdService } from "@/core/IdService.js";
import { QueryService } from "@/core/QueryService.js";
import ActiveUsersChart from "@/core/chart/charts/active-users.js";
import { NoteEntityService } from "@/core/entities/NoteEntityService.js";
import { DI } from "@/di-symbols.js";
import { normalizeForSearch } from "@/misc/normalize-for-search.js";
import { safeForSql } from "@/misc/safe-for-sql.js";
import type {
	ChannelsRepository,
	Note,
	NotesRepository,
} from "@/models/index.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { Inject, Injectable } from "@nestjs/common";
import * as Redis from "ioredis";
import { Brackets } from "typeorm";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["notes", "channels"],

	requireCredential: false,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "Note",
		},
	},

	errors: {
		noSuchChannel: {
			message: "No such channel.",
			code: "NO_SUCH_CHANNEL",
			id: "4d0eeeba-a02c-4c3c-9966-ef60d38d2e7f",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		channelId: { type: "string", format: "misskey:id" },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
		sinceDate: { type: "integer" },
		untilDate: { type: "integer" },
	},
	required: ["channelId"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.redis)
		private redisClient: Redis.Redis,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		@Inject(DI.channelsRepository)
		private channelsRepository: ChannelsRepository,

		private idService: IdService,
		private noteEntityService: NoteEntityService,
		private queryService: QueryService,
		private activeUsersChart: ActiveUsersChart,
	) {
		super(meta, paramDef, async (ps, me) => {
			const channel = await this.channelsRepository.findOneBy({
				id: ps.channelId,
			});

			if (channel == null) {
				throw new ApiError(meta.errors.noSuchChannel);
			}

			let timeline: Note[] = [];

			const limit = ps.limit + (ps.untilId ? 1 : 0); // untilIdに指定したものも含まれるため+1
			let noteIdsRes: [string, string[]][] = [];

			if (!ps.sinceId && !ps.sinceDate) {
				noteIdsRes = await this.redisClient.xrevrange(
					`channelTimeline:${channel.id}`,
					ps.untilId
						? this.idService.parse(ps.untilId).date.getTime()
						: (ps.untilDate ?? "+"),
					"-",
					"COUNT",
					limit,
				);
			}

			// redis から取得していないとき・取得数が足りないとき
			// チャンネル作成直後が遅いのでその場合はRedisキャッシュのみ見る
			if (noteIdsRes.length < limit && channel.notesCount > limit) {
				//#region Construct query
				const query = this.queryService
					.makePaginationQuery(
						this.notesRepository.createQueryBuilder("note"),
						ps.sinceId,
						ps.untilId,
						ps.sinceDate,
						ps.untilDate,
					)
					.innerJoinAndSelect("note.user", "user")
					.leftJoinAndSelect("note.reply", "reply")
					.leftJoinAndSelect("note.renote", "renote")
					.leftJoinAndSelect("reply.user", "replyUser")
					.leftJoinAndSelect("renote.user", "renoteUser")
					.leftJoinAndSelect("note.channel", "channel");

				query.andWhere(
					new Brackets((qb) => {
						qb.where("note.channelId = :channelId", { channelId: channel.id });
						qb.orWhere(
							new Brackets((qb2) => {
								qb2.where("note.userHost IS NOT NULL");
								qb2.andWhere(`'{"${channel.id}"}' <@ note.antennaChannelIds`);
							}),
						);
						for (const tag of channel.tags) {
							if (!safeForSql(normalizeForSearch(tag))) continue;
							qb.orWhere(
								new Brackets((qb2) => {
									qb2.where("note.userHost IS NULL");
									qb2.andWhere("note.visibility = 'public'");
									qb2.andWhere(`'{"${normalizeForSearch(tag)}"}' <@ note.tags`);
								}),
							);
						}
					}),
				);

				if (me) {
					this.queryService.generateMutedUserQuery(query, me);
					this.queryService.generateMutedNoteQuery(query, me);
					this.queryService.generateBlockedUserQuery(query, me);
				}
				//#endregion

				try {
					// ノート数が多い場合にタイムアウトする可能性がある
					timeline = await query.limit(ps.limit).getMany();
				} catch {
					timeline = [];
				}
			} else {
				const noteIds = noteIdsRes
					.map((x) => x[1][1])
					.filter((x) => x !== ps.untilId);

				if (noteIds.length === 0) {
					return [];
				}

				//#region Construct query
				const query = this.notesRepository
					.createQueryBuilder("note")
					.where("note.id IN (:...noteIds)", { noteIds: noteIds })
					.innerJoinAndSelect("note.user", "user")
					.leftJoinAndSelect("note.reply", "reply")
					.leftJoinAndSelect("note.renote", "renote")
					.leftJoinAndSelect("reply.user", "replyUser")
					.leftJoinAndSelect("renote.user", "renoteUser")
					.leftJoinAndSelect("note.channel", "channel");

				if (me) {
					this.queryService.generateMutedUserQuery(query, me);
					this.queryService.generateMutedNoteQuery(query, me);
					this.queryService.generateBlockedUserQuery(query, me);
				}
				//#endregion

				timeline = await query.getMany();
				timeline.sort((a, b) => (a.id > b.id ? -1 : 1));
			}

			if (me) this.activeUsersChart.read(me);

			return await this.noteEntityService.packMany(timeline, me);
		});
	}
}
