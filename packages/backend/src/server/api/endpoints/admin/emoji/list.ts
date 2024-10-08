import type { QueryService } from "@/core/QueryService.js";
import type { EmojiEntityService } from "@/core/entities/EmojiEntityService.js";
import { DI } from "@/di-symbols.js";
import type { Emoji } from "@/models/entities/Emoji.js";
import type { EmojisRepository } from "@/models/index.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { Inject, Injectable } from "@nestjs/common";

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireRolePolicy: "canManageCustomEmojis",
	kind: "read:admin:emoji",

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			properties: {
				id: {
					type: "string",
					optional: false,
					nullable: false,
					format: "id",
				},
				aliases: {
					type: "array",
					optional: false,
					nullable: false,
					items: {
						type: "string",
						optional: false,
						nullable: false,
					},
				},
				name: {
					type: "string",
					optional: false,
					nullable: false,
				},
				category: {
					type: "string",
					optional: false,
					nullable: true,
				},
				url: {
					type: "string",
					optional: false,
					nullable: false,
				},
				host: {
					type: "string",
					optional: false,
					nullable: true,
					description:
						"The local host is represented with `null`. The field exists for compatibility with other API endpoints that return files.",
				},
			},
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		query: { type: "string", nullable: true, default: null },
		draft: { type: "boolean", nullable: true, default: null },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
	},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.emojisRepository)
		private emojisRepository: EmojisRepository,

		@Inject(DI.emojiEntityService)
		private emojiEntityService: EmojiEntityService,

		@Inject(DI.queryService)
		private queryService: QueryService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const q = this.queryService
				.makePaginationQuery(
					this.emojisRepository.createQueryBuilder("emoji"),
					ps.sinceId,
					ps.untilId,
				)
				.andWhere("emoji.host IS NULL");

			let emojis: Emoji[];

			if (ps.draft !== null) {
				if (ps.draft) {
					q.andWhere("emoji.status = 'DRAFT'");
				} else {
					q.andWhere("emoji.status = 'APPROVED'");
				}
			}

			if (ps.query) {
				emojis = await q.getMany();
				const queryarry = ps.query.match(/\:([a-z0-9_]*)\:/g);

				if (queryarry) {
					emojis = emojis.filter((emoji) =>
						queryarry.includes(`:${emoji.name}:`),
					);
				} else {
					emojis = emojis.filter(
						(emoji) =>
							emoji.name.includes(ps.query!) ||
							emoji.aliases.some((a) => a.includes(ps.query!)) ||
							emoji.category?.includes(ps.query!),
					);
				}
				emojis.splice(ps.limit + 1);
			} else {
				emojis = await q.limit(ps.limit).getMany();
			}

			return this.emojiEntityService.packDetailedMany(emojis);
		});
	}
}
