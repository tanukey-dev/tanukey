import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { EmojisRepository, DriveFilesRepository, UsersRepository } from '@/models/index.js';
import type { Packed } from '@/misc/json-schema.js';
import type { } from '@/models/entities/Blocking.js';
import type { Emoji } from '@/models/entities/Emoji.js';
import { bindThis } from '@/decorators.js';

@Injectable()
export class EmojiEntityService {
	constructor(
		@Inject(DI.emojisRepository)
		private emojisRepository: EmojisRepository,

		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,
	) {
	}

	@bindThis
	public async packSimple(
		src: Emoji['id'] | Emoji,
	): Promise<Packed<'EmojiSimple'>> {
		const emoji = typeof src === 'object' ? src : await this.emojisRepository.findOneByOrFail({ id: src });

		return {
			updatedAt: emoji.updatedAt ? emoji.updatedAt.toDateString() : null,
			aliases: emoji.aliases,
			name: emoji.name,
			category: emoji.category,
			// || emoji.originalUrl してるのは後方互換性のため（publicUrlはstringなので??はだめ）
			url: emoji.publicUrl || emoji.originalUrl,
			draft: emoji.draft,
			isSensitive: emoji.isSensitive ? true : undefined,
			roleIdsThatCanBeUsedThisEmojiAsReaction: emoji.roleIdsThatCanBeUsedThisEmojiAsReaction.length > 0 ? emoji.roleIdsThatCanBeUsedThisEmojiAsReaction : undefined,
		};
	}

	@bindThis
	public packSimpleMany(
		emojis: any[],
	) {
		return Promise.all(emojis.map(x => this.packSimple(x)));
	}

	@bindThis
	public async packDetailed(
		src: Emoji['id'] | Emoji,
	): Promise<Packed<'EmojiDetailed'>> {
		const emoji = typeof src === 'object' ? src : await this.emojisRepository.findOneByOrFail({ id: src });
		const file = emoji.driveFileId ? await this.driveFilesRepository.findOneBy({ id: emoji.driveFileId }) : null;
		const user = file?.userId ? await this.usersRepository.findOneBy({ id: file.userId }) : null;

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
			draft: emoji.draft,
			isSensitive: emoji.isSensitive,
			localOnly: emoji.localOnly,
			roleIdsThatCanBeUsedThisEmojiAsReaction: emoji.roleIdsThatCanBeUsedThisEmojiAsReaction,
			uploadedUserName: user?.username ?? null,
		};
	}

	@bindThis
	public packDetailedMany(
		emojis: any[],
	) {
		return Promise.all(emojis.map(x => this.packDetailed(x)));
	}
}

