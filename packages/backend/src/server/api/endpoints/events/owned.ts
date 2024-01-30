import { Inject, Injectable } from '@nestjs/common';
import { Brackets } from 'typeorm';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { EventsRepository } from '@/models/index.js';
import { QueryService } from '@/core/QueryService.js';
import { EventEntityService } from '@/core/entities/EventEntityService.js';
import { DI } from '@/di-symbols.js';

export const meta = {
	tags: ['events', 'account'],

	requireCredential: true,

	kind: 'read:events',

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'Event',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		sinceId: { type: 'string', format: 'misskey:id' },
		untilId: { type: 'string', format: 'misskey:id' },
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 5 },
	},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.eventsRepository)
		private eventsRepository: EventsRepository,

		private eventEntityService: EventEntityService,
		private queryService: QueryService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const query = this.queryService.makePaginationQuery(this.eventsRepository.createQueryBuilder('event'), ps.sinceId, ps.untilId)
				.andWhere({ userId: me.id })
				.andWhere('event.isArchived = FALSE');

			const channels = await query
				.take(ps.limit)
				.getMany();

			return await Promise.all(channels.map(x => this.eventEntityService.pack(x, me)));
		});
	}
}
