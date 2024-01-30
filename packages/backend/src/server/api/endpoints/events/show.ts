import { Inject, Injectable } from '@nestjs/common';
import { Brackets, In, MoreThan, LessThan } from 'typeorm';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { Event, EventsRepository } from '@/models/index.js';
import { EventEntityService } from '@/core/entities/EventEntityService.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['events'],

	requireCredential: false,

	res: {
		optional: false, nullable: false,
		oneOf: [
			{
				type: 'object',
				ref: 'Event',
			},
			{
				type: 'array',
				items: {
					type: 'object',
					ref: 'Event',
				},
			},
		],
	},

	errors: {
		noSuchEvent: {
			message: 'No such event.',
			code: 'NO_SUCH_EVENT',
			id: '6f6c314b-7486-4893-8966-c04a66a02923',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		eventId: { type: 'string', format: 'misskey:id' },
		eventIds: { type: 'array', uniqueItems: true, items: {
			type: 'string', format: 'misskey:id',
		} },
		time: { type: 'integer' },
	},
	anyOf: [
		{ required: ['eventId'] },
		{ required: ['eventIds'] },
		{ required: ['time'] },
	],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.eventsRepository)
		private eventsRepository: EventsRepository,

		private eventEntityService: EventEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			if (ps.time) {
				const start = new Date(ps.time);
				const end = new Date(ps.time);
				start.setMonth(start.getMonth() - 3);
				end.setMonth(end.getMonth() + 3);

				const events = await this.eventsRepository.createQueryBuilder('event')
					.where({ startsAt: MoreThan(start) })
					.andWhere({ expiresAt: LessThan(end) })
					.andWhere('event.isArchived = FALSE')
					.getMany();

				return await Promise.all(events.map(x => this.eventEntityService.pack(x, me)));
			} else if (ps.eventIds) {
				const events = await this.eventsRepository.createQueryBuilder('event')
					.where({ id: In(ps.eventIds) })
					.andWhere('event.isArchived = FALSE')
					.getMany();

				// リクエストされた通りに並べ替え
				const _events: Event[] = [];
				for (const id of ps.channelIds) {
					_events.push(events.find(x => x.id === id)!);
				}

				return await Promise.all(_events.map(x => this.eventEntityService.pack(x, me)));
			} else {
				const event = await this.eventsRepository.findOneBy({
					id: ps.eventId,
				});

				if (event == null) {
					throw new ApiError(meta.errors.noSuchEvent);
				}

				return await this.eventEntityService.pack(event, me, true);
			}
		});
	}
}
