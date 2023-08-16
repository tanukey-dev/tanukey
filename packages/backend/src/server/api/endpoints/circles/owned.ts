import { Inject, Injectable } from '@nestjs/common';
import { Brackets } from 'typeorm';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { CirclesRepository } from '@/models/index.js';
import { QueryService } from '@/core/QueryService.js';
import { CircleEntityService } from '@/core/entities/CircleEntityService.js';
import { DI } from '@/di-symbols.js';

export const meta = {
	tags: ['circle', 'account'],

	requireCredential: true,

	kind: 'read:circles',

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'Circle',
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
		@Inject(DI.circlesRepository)
		private circlesRepository: CirclesRepository,

		private circleEntityService: CircleEntityService,
		private queryService: QueryService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const query = this.queryService.makePaginationQuery(this.circlesRepository.createQueryBuilder('circle'), ps.sinceId, ps.untilId)
				.andWhere({ userId: me.id });

			const channels = await query
				.take(ps.limit)
				.getMany();

			return await Promise.all(channels.map(x => this.circleEntityService.pack(x, me)));
		});
	}
}
