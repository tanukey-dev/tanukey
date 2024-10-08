import { CustomEmojiService } from "@/core/CustomEmojiService.js";
import { ModerationLogService } from "@/core/ModerationLogService.js";
import { DI } from "@/di-symbols.js";
import { EmojiStatus } from "@/models/entities/Emoji.js";
import type { DriveFilesRepository } from "@/models/index.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { Inject, Injectable } from "@nestjs/common";
import { ApiError } from "../../../error.js";

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireRolePolicy: "canRequestCustomEmojis",
	kind: "read:account",

	errors: {
		noSuchFile: {
			message: "No such file.",
			code: "NO_SUCH_FILE",
			id: "fc46b5a4-6b92-4c33-ac66-b806659bb5cf",
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
		name: { type: "string", pattern: "^[a-zA-Z0-9_]+$" },
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
		fileId: { type: "string", format: "misskey:id" },
		isSensitive: { type: "boolean" },
		localOnly: { type: "boolean" },
	},
	required: ["name", "fileId"],
} as const;

// TODO: ロジックをサービスに切り出す

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private customEmojiService: CustomEmojiService,

		private moderationLogService: ModerationLogService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const driveFile = await this.driveFilesRepository.findOneBy({
				id: ps.fileId,
			});

			if (driveFile == null) throw new ApiError(meta.errors.noSuchFile);

			const emoji = await this.customEmojiService.add({
				driveFile,
				name: ps.name,
				category: ps.category ?? null,
				aliases: ps.aliases ?? [],
				license: ps.license ?? null,
				host: null,
				status: EmojiStatus.DRAFT,
				isSensitive: ps.isSensitive ?? false,
				localOnly: ps.localOnly ?? false,
				roleIdsThatCanBeUsedThisEmojiAsReaction: [],
			});

			this.moderationLogService.insertModerationLog(me, "addEmoji", {
				emojiId: emoji.id,
			});

			return {
				id: emoji.id,
			};
		});
	}
}
