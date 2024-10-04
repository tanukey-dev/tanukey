import { IdService } from "@/core/IdService.js";
import { MetaService } from "@/core/MetaService.js";
import { QueryService } from "@/core/QueryService.js";
import { RoleService } from "@/core/RoleService.js";
import ActiveUsersChart from "@/core/chart/charts/active-users.js";
import { NoteEntityService } from "@/core/entities/NoteEntityService.js";
import { DI } from "@/di-symbols.js";
import type { FollowingsRepository, NotesRepository } from "@/models/index.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { Inject, Injectable } from "@nestjs/common";
import { Brackets } from "typeorm";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["notes"],

	requireCredential: true,
	kind: "read:account",

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
		stlDisabled: {
			message: "Hybrid timeline has been disabled.",
			code: "STL_DISABLED",
			id: "620763f4-f621-4533-ab33-0577a1a3c342",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
		sinceDate: { type: "integer" },
		untilDate: { type: "integer" },
		includeMyRenotes: { type: "boolean", default: true },
		includeRenotedMyNotes: { type: "boolean", default: true },
		includeLocalRenotes: { type: "boolean", default: true },
		withFiles: { type: "boolean", default: false },
		withReplies: { type: "boolean", default: false },
		withRemote: { type: "boolean", default: false },
		withChannel: { type: "boolean", default: false },
	},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		@Inject(DI.followingsRepository)
		private followingsRepository: FollowingsRepository,

		private noteEntityService: NoteEntityService,
		private queryService: QueryService,
		private metaService: MetaService,
		private roleService: RoleService,
		private activeUsersChart: ActiveUsersChart,
		private idService: IdService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const policies = await this.roleService.getUserPolicies(me.id);
			if (!policies.ltlAvailable) {
				throw new ApiError(meta.errors.stlDisabled);
			}

			//#region Construct query
			const followingQuery = this.followingsRepository
				.createQueryBuilder("following")
				.select("following.followeeId")
				.where("following.followerId = :followerId", { followerId: me.id });

			if (!ps.withRemote) {
				followingQuery.andWhere("following.followeeHost IS NULL");
			}

			const query = this.queryService
				.makePaginationQuery(
					this.notesRepository.createQueryBuilder("note"),
					ps.sinceId,
					ps.untilId,
					ps.sinceDate,
					ps.untilDate,
				)
				.andWhere("note.id > :minId", {
					minId: this.idService.genId(
						new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
					),
				}) // 10日前まで
				.andWhere(
					new Brackets((qb) => {
						qb.where(
							`((note.userId IN (${followingQuery.getQuery()})) OR (note.userId = :meId))`,
							{ meId: me.id },
						).orWhere(
							"(note.visibility = 'public') AND (note.userHost IS NULL)",
						);
					}),
				)
				.andWhere("note.visibility != 'specified'")
				.innerJoinAndSelect("note.user", "user")
				.leftJoinAndSelect("note.reply", "reply")
				.leftJoinAndSelect("note.renote", "renote")
				.leftJoinAndSelect("reply.user", "replyUser")
				.leftJoinAndSelect("renote.user", "renoteUser")
				.setParameters(followingQuery.getParameters());

			if (ps.withChannel) {
				this.queryService.generateChannelQuery(query, me);
			} else {
				query.andWhere("note.channelId IS NULL");
			}

			this.queryService.generateRepliesQuery(query, ps.withReplies, me);
			this.queryService.generateVisibilityQuery(query, me);
			this.queryService.generateMutedUserQuery(query, me);
			this.queryService.generateMutedNoteQuery(query, me);
			this.queryService.generateBlockedUserQuery(query, me);
			this.queryService.generateMutedUserRenotesQueryForNotes(query, me);

			if (ps.includeMyRenotes === false) {
				query.andWhere(
					new Brackets((qb) => {
						qb.orWhere("note.userId != :meId", { meId: me.id });
						qb.orWhere("note.renoteId IS NULL");
						qb.orWhere("note.text IS NOT NULL");
						qb.orWhere("note.fileIds != '{}'");
						qb.orWhere(
							'0 < (SELECT COUNT(*) FROM poll WHERE poll."noteId" = note.id)',
						);
					}),
				);
			}

			if (ps.includeRenotedMyNotes === false) {
				query.andWhere(
					new Brackets((qb) => {
						qb.orWhere("note.renoteUserId != :meId", { meId: me.id });
						qb.orWhere("note.renoteId IS NULL");
						qb.orWhere("note.text IS NOT NULL");
						qb.orWhere("note.fileIds != '{}'");
						qb.orWhere(
							'0 < (SELECT COUNT(*) FROM poll WHERE poll."noteId" = note.id)',
						);
					}),
				);
			}

			if (ps.includeLocalRenotes === false) {
				query.andWhere(
					new Brackets((qb) => {
						qb.orWhere("note.renoteUserHost IS NOT NULL");
						qb.orWhere("note.renoteId IS NULL");
						qb.orWhere("note.text IS NOT NULL");
						qb.orWhere("note.fileIds != '{}'");
						qb.orWhere(
							'0 < (SELECT COUNT(*) FROM poll WHERE poll."noteId" = note.id)',
						);
					}),
				);
			}

			if (ps.withFiles) {
				query.andWhere("note.fileIds != '{}'");
			}
			//#endregion

			const timeline = await query.limit(ps.limit).getMany();

			process.nextTick(() => {
				this.activeUsersChart.read(me);
			});

			return await this.noteEntityService.packMany(timeline, me);
		});
	}
}
