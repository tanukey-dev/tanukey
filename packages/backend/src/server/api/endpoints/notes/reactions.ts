import { Inject, Injectable } from "@nestjs/common";
import type {
	NoteReactionsRepository,
	MutingsRepository,
} from "@/models/Repositories.js";
import type { NoteReaction } from "@/models/entities/NoteReaction.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { NoteReactionEntityService } from "@/core/entities/NoteReactionEntityService.js";
import { DI } from "@/di-symbols.js";
import type { FindOptionsWhere } from "typeorm";

export const meta = {
	tags: ["notes", "reactions"],

	requireCredential: false,

	allowGet: true,
	cacheSec: 60,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "NoteReaction",
		},
	},

	errors: {
		noSuchNote: {
			message: "No such note.",
			code: "NO_SUCH_NOTE",
			id: "263fff3d-d0e1-4af4-bea7-8408059b451a",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		noteId: { type: "string", format: "misskey:id" },
		type: { type: "string", nullable: true },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		offset: { type: "integer", default: 0 },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
	},
	required: ["noteId"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.noteReactionsRepository)
		private noteReactionsRepository: NoteReactionsRepository,

		@Inject(DI.mutingsRepository)
		private mutingsRepository: MutingsRepository,

		private noteReactionEntityService: NoteReactionEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const query = {
				noteId: ps.noteId,
			} as FindOptionsWhere<NoteReaction>;

			if (ps.type) {
				// ローカルリアクションはホスト名が . とされているが
				// DB 上ではそうではないので、必要に応じて変換
				const suffix = "@.:";
				const type = ps.type.endsWith(suffix)
					? ps.type.slice(0, ps.type.length - suffix.length) + ":"
					: ps.type;
				query.reaction = type;
			}

			const reactions = await this.noteReactionsRepository.find({
				where: query,
				take: ps.limit,
				skip: ps.offset,
				order: {
					id: -1,
				},
				relations: ["user", "note"],
			});

			if (me) {
				const mutings = await this.mutingsRepository
					.createQueryBuilder("muting")
					.select("muting.muteeId")
					.where("muting.muterId = :muterId", { muterId: me.id })
					.getMany();

				if (mutings.length > 0) {
					const mutingUsers = mutings.map((muting) => muting.muteeId);
					if (mutingUsers.length > 0) {
						return await Promise.all(
							reactions
								.filter((re) => !mutingUsers.includes(re.userId))
								.map((reaction) =>
									this.noteReactionEntityService.pack(reaction, me),
								),
						);
					}
				}
			}

			return await Promise.all(
				reactions.map((reaction) =>
					this.noteReactionEntityService.pack(reaction, me),
				),
			);
		});
	}
}
