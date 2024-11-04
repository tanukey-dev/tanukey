import { bindThis } from "@/decorators.js";
import { DI } from "@/di-symbols.js";
import type { Packed } from "@/misc/json-schema.js";
import type {} from "@/models/entities/Blocking.js";
import { DriveFile } from "@/models/entities/DriveFile.js";
import type { Emoji } from "@/models/entities/Emoji.js";
import { User } from "@/models/entities/User.js";
import type {
	DriveFilesRepository,
	EmojisRepository,
	UsersRepository,
} from "@/models/Repositories.js";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class EmojiEntityService {
	constructor(
		@Inject(DI.emojisRepository)
		private emojisRepository: EmojisRepository,

		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,
	) {}

	@bindThis
	public async packSimple(
		src: Emoji["id"] | Emoji,
	): Promise<Packed<"EmojiSimple">> {
		const emoji =
			typeof src === "object"
				? src
				: await this.emojisRepository.findOneByOrFail({ id: src });

		return {
			id: emoji.id,
			updatedAt: emoji.updatedAt ? emoji.updatedAt.toDateString() : null,
			aliases: emoji.aliases,
			name: emoji.name,
			category: emoji.category,
			// || emoji.originalUrl してるのは後方互換性のため（publicUrlはstringなので??はだめ）
			url: emoji.publicUrl || emoji.originalUrl,
			status: emoji.status,
			isSensitive: emoji.isSensitive ? true : undefined,
			roleIdsThatCanBeUsedThisEmojiAsReaction:
				emoji.roleIdsThatCanBeUsedThisEmojiAsReaction.length > 0
					? emoji.roleIdsThatCanBeUsedThisEmojiAsReaction
					: undefined,
			host: emoji.host,
		};
	}

	@bindThis
	public packSimpleMany(emojis: any[]) {
		return Promise.all(emojis.map((x) => this.packSimple(x)));
	}

	@bindThis
	public async packAll(): Promise<Packed<"EmojiDetailed">[]> {
		const emojis = await this.emojisRepository
			.createQueryBuilder("emoji")
			.addSelect("user.username", "uploadedUserName")
			.addSelect("file.id", "fileId")
			.leftJoin(DriveFile, "file", "emoji.driveFileId = file.id")
			.leftJoin(User, "user", "file.userId = user.id")
			.andWhere("emoji.host IS NULL")
			.orderBy("emoji.category", "ASC")
			.addOrderBy("emoji.name", "ASC")
			.getRawMany();

		return emojis.map((emoji) => {
			return {
				id: emoji.emoji_id,
				updatedAt: emoji.emoji_updatedAt
					? emoji.emoji_updatedAt.toDateString()
					: null,
				aliases: emoji.emoji_aliases,
				name: emoji.emoji_name,
				category: emoji.emoji_category,
				host: emoji.emoji_host,
				// || emoji.originalUrl してるのは後方互換性のため（publicUrlはstringなので??はだめ）
				url: emoji.emoji_publicUrl || emoji.emoji_originalUrl,
				license: emoji.emoji_license,
				status: emoji.emoji_status,
				isSensitive: emoji.emoji_isSensitive,
				localOnly: emoji.emoji_localOnly,
				roleIdsThatCanBeUsedThisEmojiAsReaction:
					emoji.emoji_roleIdsThatCanBeUsedThisEmojiAsReaction,
				// リモートユーザーの場合、ファイルがあってもユーザー名が取れない
				uploadedUserName: emoji.fileId ? (emoji.uploadedUserName ?? "") : null,
			};
		});
	}

	@bindThis
	public async packDetailed(
		src: Emoji["id"] | Emoji,
	): Promise<Packed<"EmojiDetailed">> {
		const emoji =
			typeof src === "object"
				? src
				: await this.emojisRepository.findOneByOrFail({ id: src });
		const file = emoji.driveFileId
			? await this.driveFilesRepository.findOneBy({ id: emoji.driveFileId })
			: null;
		const user = file?.userId
			? await this.usersRepository.findOneBy({ id: file.userId })
			: null;

		return {
			id: emoji.id,
			updatedAt: emoji.updatedAt ? emoji.updatedAt.toDateString() : null,
			aliases: emoji.aliases,
			name: emoji.name,
			category: emoji.category,
			host: emoji.host,
			// || emoji.originalUrl してるのは後方互換性のため（publicUrlはstringなので??はだめ）
			url: emoji.publicUrl || emoji.originalUrl,
			license: emoji.license,
			status: emoji.status,
			isSensitive: emoji.isSensitive,
			localOnly: emoji.localOnly,
			roleIdsThatCanBeUsedThisEmojiAsReaction:
				emoji.roleIdsThatCanBeUsedThisEmojiAsReaction,
			// リモートユーザーの場合、ファイルがあってもユーザー名が取れない
			uploadedUserName: file ? (user?.username ?? "") : null,
		};
	}

	@bindThis
	public packDetailedMany(emojis: any[]) {
		return Promise.all(emojis.map((x) => this.packDetailed(x)));
	}
}
