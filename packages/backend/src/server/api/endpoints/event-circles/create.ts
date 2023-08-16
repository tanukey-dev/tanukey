import { Inject, Injectable } from '@nestjs/common';
import ms from 'ms';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { DriveFilesRepository, EventCirclesRepository, CirclesRepository, EventsRepository } from '@/models/index.js';
import type { EventCircle } from '@/models/entities/EventCircle.js';
import { IdService } from '@/core/IdService.js';
import { EventCircleEntityService } from '@/core/entities/EventCircleEntityService.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['eventCircles'],

	requireCredential: true,

	prohibitMoved: true,

	kind: 'write:eventCircles',

	limit: {
		duration: ms('1hour'),
		max: 10,
	},

	res: {
		type: 'object',
		optional: false, nullable: false,
		ref: 'EventCircle',
	},

	errors: {
		noSuchFile: {
			message: 'No such file.',
			code: 'NO_SUCH_FILE',
			id: 'cd1e9f3e-5a12-4ab4-96f6-5d0a2cc32050',
		},

		noSuchEvent: {
			message: 'No such event.',
			code: 'NO_SUCH_EVENT',
			id: '6f6c314b-7486-4893-8966-c04a66a02923',
		},

		noSuchCircle: {
			message: 'No such circle.',
			code: 'NO_SUCH_CIRCLE',
			id: '6f6c314b-7486-4892-8965-c04a67a02923',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		eventId: { type: 'string', format: 'misskey:id', nullable: false },
		circleId: { type: 'string', format: 'misskey:id', nullable: false },
		description: { type: 'string', nullable: true, minLength: 1, maxLength: 8192 },
		circleImageId: { type: 'string', format: 'misskey:id', nullable: true },
	},
	required: ['eventId', 'circleId'],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		@Inject(DI.eventCirclesRepository)
		private eventCirclesRepository: EventCirclesRepository,

		@Inject(DI.circlesRepository)
		private circlesRepository: CirclesRepository,

		@Inject(DI.eventsRepository)
		private eventsRepository: EventsRepository,

		private idService: IdService,
		private eventCircleEntityService: EventCircleEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			let banner = null;
			if (ps.circleImageId != null) {
				banner = await this.driveFilesRepository.findOneBy({
					id: ps.circleImageId,
					userId: me.id,
				});

				if (banner == null) {
					throw new ApiError(meta.errors.noSuchFile);
				}
			}

			const event = await this.eventsRepository.findOneBy({
				id: ps.eventId,
			});

			if (event == null) {
				throw new ApiError(meta.errors.noSuchEvent);
			}

			const circle = await this.circlesRepository.findOneBy({
				id: ps.circleId,
			});
			
			if (circle == null) {
				throw new ApiError(meta.errors.noSuchCircle);
			}

			const eventCircle = await this.eventCirclesRepository.insert({
				id: this.idService.genId(),
				createdAt: new Date(),
				eventId: ps.eventId,
				circleId: ps.circleId,
				description: ps.description ?? null,
				circleImageId: banner ? banner.id : null,
			} as EventCircle).then(x => this.eventCirclesRepository.findOneByOrFail(x.identifiers[0]));

			return await this.eventCircleEntityService.pack(eventCircle, me);
		});
	}
}
