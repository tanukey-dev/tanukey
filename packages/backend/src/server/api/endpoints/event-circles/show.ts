import { Inject, Injectable } from '@nestjs/common';
import { Brackets, In } from 'typeorm';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { EventCircle, EventCirclesRepository } from '@/models/index.js';
import { QueryService } from '@/core/QueryService.js';
import { EventCircleEntityService } from '@/core/entities/EventCircleEntityService.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['eventCircles'],

	requireCredential: false,

	res: {
		optional: false, nullable: false,
		oneOf: [
			{
				type: 'object',
				ref: 'EventCircle',
			},
			{
				type: 'array',
				items: {
					type: 'object',
					ref: 'EventCircle',
				},
			},
		],
	},

	errors: {
		noSuchEventCircle: {
			message: 'No such eventCircle.',
			code: 'NO_SUCH_EVENT_CIRCLE',
			id: '6f6c314b-7486-4897-8963-c04a66a02923',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		eventCircleId: { type: 'string', format: 'misskey:id', nullable: true },
		eventId: { type: 'string', format: 'misskey:id', nullable: true },
		circleId: { type: 'string', format: 'misskey:id', nullable: true },
		sinceId: { type: 'string', format: 'misskey:id' },
		untilId: { type: 'string', format: 'misskey:id' },
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 5 },
	},
	anyOf: [
		{ required: ['eventCircleId'] },
		{ required: ['eventId'] },
		{ required: ['circleId'] },
	],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.eventCirclesRepository)
		private eventCirclesRepository: EventCirclesRepository,

		private eventCircleEntityService: EventCircleEntityService,
		private queryService: QueryService,
	) {
		super(meta, paramDef, async (ps, me) => {
			if (ps.eventId) {
				const query = this.queryService.makePaginationQuery(this.eventCirclesRepository.createQueryBuilder('eventCircle'), ps.sinceId, ps.untilId)
					.where({ eventId: ps.eventId })
					.andWhere('eventCircle.isArchived = FALSE');

				const eventCircles = await query
					.getMany();

				return await Promise.all(eventCircles.map(x => this.eventCircleEntityService.pack(x, me)));
			} else if (ps.circleId) {
				const query = this.queryService.makePaginationQuery(this.eventCirclesRepository.createQueryBuilder('eventCircle'), ps.sinceId, ps.untilId)
					.where({ circleId: ps.circleId })
					.andWhere('eventCircle.isArchived = FALSE');

				const eventCircles = await query
					.getMany();

				return await Promise.all(eventCircles.map(x => this.eventCircleEntityService.pack(x, me)));
			} else if (ps.eventCircleId) {
				const eventCircle = await this.eventCirclesRepository.findOneBy({
					id: ps.eventCircleId,
				});

				if (eventCircle == null) {
					throw new ApiError(meta.errors.noSuchEventCircle);
				}

				return await this.eventCircleEntityService.pack(eventCircle, me, true);
			}

			throw new ApiError(meta.errors.noSuchEventCircle);
		});
	}
}
