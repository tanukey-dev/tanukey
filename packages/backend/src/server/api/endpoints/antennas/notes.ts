import { IdService } from "@/core/IdService.js";
import { NoteReadService } from "@/core/NoteReadService.js";
import { QueryService } from "@/core/QueryService.js";
import { NoteEntityService } from "@/core/entities/NoteEntityService.js";
import { DI } from "@/di-symbols.js";
import type { AntennasRepository, NotesRepository } from "@/models/index.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { Inject, Injectable } from "@nestjs/common";
import * as Redis from "ioredis";
import { Brackets } from "typeorm";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["antennas", "account", "notes"],

	requireCredential: true,

	kind: "read:account",

	errors: {
		noSuchAntenna: {
			message: "No such antenna.",
			code: "NO_SUCH_ANTENNA",
			id: "850926e0-fd3b-49b6-b69a-b28a5dbd82fe",
		},
	},

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
} as const;

export const paramDef = {
	type: "object",
	properties: {
		antennaId: { type: "string", format: "misskey:id" },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
		sinceDate: { type: "integer" },
		untilDate: { type: "integer" },
	},
	required: ["antennaId"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		@Inject(DI.antennasRepository)
		private antennasRepository: AntennasRepository,

		@Inject(DI.noteEntityService)
		private noteEntityService: NoteEntityService,

		@Inject(DI.queryService)
		private queryService: QueryService,

		@Inject(DI.noteReadService)
		private noteReadService: NoteReadService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const antenna = await this.antennasRepository.findOneBy({
				id: ps.antennaId,
				userId: me.id,
			});

			if (antenna == null) {
				throw new ApiError(meta.errors.noSuchAntenna);
			}

			const query = this.notesRepository
				.createQueryBuilder("note")
				.andWhere("note.antennaIds != '{}'")
				.andWhere(`'{"${antenna.id}"}' <@ note.antennaIds`)
				.innerJoinAndSelect("note.user", "user")
				.leftJoinAndSelect("note.reply", "reply")
				.leftJoinAndSelect("note.renote", "renote")
				.leftJoinAndSelect("reply.user", "replyUser")
				.leftJoinAndSelect("renote.user", "renoteUser");

			this.queryService.generateVisibilityQuery(query, me);
			this.queryService.generateMutedUserQuery(query, me);
			this.queryService.generateBlockedUserQuery(query, me);

			//検索不可チャンネルを除外
			query.leftJoinAndSelect("note.channel", "channel").andWhere(
				new Brackets((qb) => {
					qb.orWhere("channel.searchable IS NULL");
					qb.orWhere("channel.searchable = true");
				}),
			);

			const notes = await query.limit(ps.limit).getMany();

			if (notes.length > 0) {
				this.noteReadService.read(me.id, notes);
			}

			return await this.noteEntityService.packMany(notes, me);
		});
	}
}
