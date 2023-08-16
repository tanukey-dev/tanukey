import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { CirclesRepository, DriveFilesRepository } from '@/models/index.js';
import type { Packed } from '@/misc/json-schema.js';
import type { } from '@/models/entities/Blocking.js';
import type { User } from '@/models/entities/User.js';
import type { Circle } from '@/models/entities/Circle.js';
import { bindThis } from '@/decorators.js';
import { DriveFileEntityService } from './DriveFileEntityService.js';
import { In } from 'typeorm';

@Injectable()
export class CircleEntityService {
	constructor(
		@Inject(DI.circlesRepository)
		private circlesRepository: CirclesRepository,

		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private driveFileEntityService: DriveFileEntityService,
	) {
	}

	@bindThis
	public async pack(
		src: Circle['id'] | Circle,
		me?: { id: User['id'] } | null | undefined,
		detailed?: boolean,
	): Promise<Packed<'Circle'>> {
		const circle = typeof src === 'object' ? src : await this.circlesRepository.findOneByOrFail({ id: src });
		const meId = me ? me.id : null;

		const profile = circle.profileImageId ? await this.driveFilesRepository.findOneBy({ id: circle.profileImageId }) : null;

		return {
			id: circle.id,
			createdAt: circle.createdAt.toISOString(),
			userId: circle.userId,
			name: circle.name,
			description: circle.description,
			profileImageId: profile ? profile.id : null,
			profileImageUrl: profile ? this.driveFileEntityService.getPublicUrl(profile) : null,
		};
	}
}

