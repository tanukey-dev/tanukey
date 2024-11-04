import type { NoteReadService } from "@/core/NoteReadService.js";
import type { SearchService } from "@/core/SearchService.js";
import type { NoteEntityService } from "@/core/entities/NoteEntityService.js";
import { DI } from "@/di-symbols.js";
import type {
	AntennasRepository,
	UsersRepository,
} from "@/models/Repositories.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { Inject, Injectable } from "@nestjs/common";
import { ApiError } from "../../error.js";
import * as Acct from "@/misc/acct.js";
import { IsNull } from "typeorm";

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
		@Inject(DI.antennasRepository)
		private antennasRepository: AntennasRepository,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.noteEntityService)
		private noteEntityService: NoteEntityService,

		@Inject(DI.searchService)
		private searchService: SearchService,

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

			let userIds: string[] = [];
			if (antenna.users) {
				const users = await this.usersRepository.find({
					where: [
						...antenna.users.map((username) => {
							const acct = Acct.parse(username);
							return { username: acct.username, host: acct.host ?? IsNull() };
						}),
					],
				});
				userIds = users.map((u) => u.id);
			}

			const notes = await this.searchService.searchNote(
				"",
				me,
				{
					userIds: userIds,
					origin: antenna.localOnly ? "local" : undefined,
					keywords: antenna.keywords,
					excludeKeywords: antenna.excludeKeywords,
					checkChannelSearchable: true,
					reverseOrder: false,
					hasFile: antenna.withFile,
					includeReplies: antenna.withReplies,
				},
				{
					untilId: ps.untilId,
					sinceId: ps.sinceId,
					limit: ps.limit,
				},
			);

			if (notes.length > 0) {
				this.noteReadService.read(me.id, notes);
			}

			return await this.noteEntityService.packMany(notes, me);
		});
	}
}
