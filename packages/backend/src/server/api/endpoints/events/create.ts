import { Inject, Injectable } from '@nestjs/common';
import ms from 'ms';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { EventsRepository, DriveFilesRepository } from '@/models/index.js';
import type { Event } from '@/models/entities/Event.js';
import { IdService } from '@/core/IdService.js';
import { EventEntityService } from '@/core/entities/EventEntityService.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['events'],

	requireCredential: true,
	kind: 'read:account',

	limit: {
		duration: ms('1hour'),
		max: 10,
	},

	res: {
		type: 'object',
		optional: false, nullable: false,
		ref: 'Event',
	},

	errors: {
		noSuchFile: {
			message: 'No such file.',
			code: 'NO_SUCH_FILE',
			id: 'cd1e9f3e-5a12-4ab4-96f6-5d0a2cc32050',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		name: { type: 'string', minLength: 1, maxLength: 128 },
		description: { type: 'string', nullable: true, minLength: 1, maxLength: 8192 },
		bannerId: { type: 'string', format: 'misskey:id', nullable: true },
		expiresAt: { type: 'integer' },
		startsAt: { type: 'integer' },
		pageId: { type: 'string', format: 'misskey:id', nullable: true },
	},
	required: ['name'],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		@Inject(DI.eventsRepository)
		private eventsRepository: EventsRepository,

		private idService: IdService,
		private eventEntityService: EventEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			let banner = null;
			if (ps.bannerId != null) {
				banner = await this.driveFilesRepository.findOneBy({
					id: ps.bannerId,
					userId: me.id,
				});

				if (banner == null) {
					throw new ApiError(meta.errors.noSuchFile);
				}
			}

			const event = await this.eventsRepository.insert({
				id: this.idService.genId(),
				createdAt: new Date(),
				userId: me.id,
				name: ps.name,
				description: ps.description ?? null,
				bannerId: banner ? banner.id : null,
				expiresAt: ps.expiresAt ? new Date(ps.expiresAt) : null,
				startsAt: ps.startsAt ? new Date(ps.startsAt) : null,
				pageId: ps.pageId ?? null,
			} as Event).then(x => this.eventsRepository.findOneByOrFail(x.identifiers[0]));

			return await this.eventEntityService.pack(event, me);
		});
	}
}
