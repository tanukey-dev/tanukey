import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { EventCirclesRepository, DriveFilesRepository } from '@/models/index.js';
import type { Packed } from '@/misc/json-schema.js';
import type { } from '@/models/entities/Blocking.js';
import type { User } from '@/models/entities/User.js';
import type { EventCircle } from '@/models/entities/EventCircle.js';
import { bindThis } from '@/decorators.js';
import { DriveFileEntityService } from './DriveFileEntityService.js';
import { In } from 'typeorm';

@Injectable()
export class EventCircleEntityService {
	constructor(
		@Inject(DI.eventCirclesRepository)
		private eventCirclesRepository: EventCirclesRepository,

		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private driveFileEntityService: DriveFileEntityService,
	) {
	}

	@bindThis
	public async pack(
		src: EventCircle['id'] | EventCircle,
		me?: { id: User['id'] } | null | undefined,
		detailed?: boolean,
	): Promise<Packed<'EventCircle'>> {
		const eventCircle = typeof src === 'object' ? src : await this.eventCirclesRepository.findOneByOrFail({ id: src });
		const meId = me ? me.id : null;

		const circleImage = eventCircle.circleImageId ? await this.driveFilesRepository.findOneBy({ id: eventCircle.circleImageId }) : null;

		return {
			id: eventCircle.id,
			createdAt: eventCircle.createdAt.toISOString(),
			eventId: eventCircle.eventId,
			circleId: eventCircle.circleId,
			description: eventCircle.description,
			circleImageId: circleImage ? circleImage.id : null,
			circleImageUrl: circleImage ? this.driveFileEntityService.getPublicUrl(circleImage) : null,
		};
	}
}

