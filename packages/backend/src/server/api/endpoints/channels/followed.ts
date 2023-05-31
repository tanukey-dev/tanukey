import { Inject, Injectable } from '@nestjs/common';
import { Brackets } from 'typeorm';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { ChannelFollowingsRepository } from '@/models/index.js';
import { QueryService } from '@/core/QueryService.js';
import { ChannelEntityService } from '@/core/entities/ChannelEntityService.js';
import { DI } from '@/di-symbols.js';

export const meta = {
	tags: ['channels', 'account'],

	requireCredential: true,

	kind: 'read:channels',

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'Channel',
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
		@Inject(DI.channelFollowingsRepository)
		private channelFollowingsRepository: ChannelFollowingsRepository,

		private channelEntityService: ChannelEntityService,
		private queryService: QueryService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const query = this.queryService.makePaginationQuery(this.channelFollowingsRepository.createQueryBuilder('following'), ps.sinceId, ps.untilId)
				.andWhere('following.followerId = :meId', { meId: me.id })
				.andWhere(new Brackets(qb => { qb
					.where('channel.isPrivate = FALSE')
					.orWhere(new Brackets(qb2 => { qb2
						.where('channel.isPrivate = TRUE')
						.andWhere(new Brackets(qb3 => { qb3
							.where(':id = ANY(channel.privateUserIds)', { id: me?.id })
							.orWhere('channel.userId = :id', { id: me?.id });
						}));
					}));
				}))
				.leftJoinAndSelect('following.followee', 'channel');

			const followings = await query
				.take(ps.limit)
				.getMany();

			return await Promise.all(followings.map(x => this.channelEntityService.pack(x.followeeId, me)));
		});
	}
}
