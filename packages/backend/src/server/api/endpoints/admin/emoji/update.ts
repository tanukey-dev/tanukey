import { CustomEmojiService } from "@/core/CustomEmojiService.js";
import { DI } from "@/di-symbols.js";
import { EmojiStatus } from "@/models/entities/Emoji.js";
import type { DriveFilesRepository } from "@/models/index.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { Inject, Injectable } from "@nestjs/common";
import { ApiError } from "../../../error.js";

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireRolePolicy: "canManageCustomEmojis",
	kind: "write:admin:emoji",

	errors: {
		noSuchEmoji: {
			message: "No such emoji.",
			code: "NO_SUCH_EMOJI",
			id: "684dec9d-a8c2-4364-9aa8-456c49cb1dc8",
		},
		noSuchFile: {
			message: "No such file.",
			code: "NO_SUCH_FILE",
			id: "14fb9fd9-0731-4e2f-aeb9-f09e4740333d",
		},
		sameNameEmojiExists: {
			message: "Emoji that have same name already exists.",
			code: "SAME_NAME_EMOJI_EXISTS",
			id: "7180fe9d-1ee3-bff9-647d-fe9896d2ffb8",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		id: { type: "string", format: "misskey:id" },
		name: { type: "string", pattern: "^[a-zA-Z0-9_]+$" },
		fileId: { type: "string", format: "misskey:id" },
		category: {
			type: "string",
			nullable: true,
			description: "Use `null` to reset the category.",
		},
		aliases: {
			type: "array",
			items: {
				type: "string",
			},
		},
		license: { type: "string", nullable: true },
		status: {
			type: "string",
			enum: ["DRAFT", "APPROVED", "REJECTED"],
		},
		isSensitive: { type: "boolean" },
		localOnly: { type: "boolean" },
		roleIdsThatCanBeUsedThisEmojiAsReaction: {
			type: "array",
			items: {
				type: "string",
			},
		},
	},
	required: ["id", "name", "aliases"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private customEmojiService: CustomEmojiService,
	) {
		super(meta, paramDef, async (ps, me) => {
			let driveFile = null;

			if (ps.fileId) {
				driveFile = await this.driveFilesRepository.findOneBy({
					id: ps.fileId,
				});
				if (driveFile == null) throw new ApiError(meta.errors.noSuchFile);
			}

			await this.customEmojiService.update(ps.id, {
				driveFile: driveFile,
				name: ps.name,
				category: ps.category ?? null,
				aliases: ps.aliases,
				license: ps.license ?? null,
				status: ps.status
					? EmojiStatus[ps.status as keyof typeof EmojiStatus]
					: undefined,
				isSensitive: ps.isSensitive,
				localOnly: ps.localOnly,
				roleIdsThatCanBeUsedThisEmojiAsReaction:
					ps.roleIdsThatCanBeUsedThisEmojiAsReaction,
			});
		});
	}
}
