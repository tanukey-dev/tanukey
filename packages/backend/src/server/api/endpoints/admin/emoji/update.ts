import type { CustomEmojiService } from "@/core/CustomEmojiService.js";
import { DI } from "@/di-symbols.js";
import type { DriveFilesRepository, EmojisRepository } from "@/models/index.js";
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
		permissionDenied: {
			message: "permission denied.",
			code: "PERMISSION_DENIED",
			id: "684dec9d-a8c3-4364-9aa8-456c49cb2dc1",
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
		draft: { type: "boolean" },
		isSensitive: { type: "boolean" },
		localOnly: { type: "boolean" },
		roleIdsThatCanBeUsedThisEmojiAsReaction: {
			type: "array",
			items: {
				type: "string",
			},
		},
	},
	required: ["id", "name", "aliases", "draft"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		@Inject(DI.emojisRepository)
		private emojisRepository: EmojisRepository,

		private customEmojiService: CustomEmojiService,
	) {
		super(meta, paramDef, async (ps, me) => {
			let driveFile = null;

			// 元の絵文字申請者と一致するかのチェック、絵文字が削除されている場合はだれでもよい
			const oldEmoji = await this.emojisRepository.findOneByOrFail({
				id: ps.id,
			});
			if (oldEmoji.driveFileId) {
				const oldDriveFile = await this.driveFilesRepository.findOneBy({
					id: oldEmoji.driveFileId,
				});
				if (oldDriveFile) {
					if (oldDriveFile.userHost === null && me.id !== oldDriveFile.userId) {
						throw new ApiError(meta.errors.permissionDenied);
					}
				}
			}

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
				draft: ps.draft,
				isSensitive: ps.isSensitive,
				localOnly: ps.localOnly,
				roleIdsThatCanBeUsedThisEmojiAsReaction:
					ps.roleIdsThatCanBeUsedThisEmojiAsReaction,
			});
		});
	}
}
