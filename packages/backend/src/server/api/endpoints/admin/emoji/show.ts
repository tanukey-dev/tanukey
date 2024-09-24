import type { Config } from "@/config.js";
import type { EmojiEntityService } from "@/core/entities/EmojiEntityService.js";
import { DI } from "@/di-symbols.js";
import type { EmojisRepository } from "@/models/index.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { Inject, Injectable } from "@nestjs/common";
import { IsNull } from "typeorm";

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireRolePolicy: "canManageCustomEmojis",
	kind: "read:admin:emoji",

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "EmojiDetailed",
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		name: {
			type: "string",
		},
	},
	required: ["name"],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.emojisRepository)
		private emojisRepository: EmojisRepository,

		@Inject(DI.emojiEntityService)
		private emojiEntityService: EmojiEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const emoji = await this.emojisRepository.findOneOrFail({
				where: {
					name: ps.name,
					host: IsNull(),
				},
			});

			return this.emojiEntityService.packDetailed(emoji);
		});
	}
}
