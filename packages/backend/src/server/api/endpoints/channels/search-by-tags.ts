import { Inject, Injectable } from '@nestjs/common';
import { Brackets } from 'typeorm';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { QueryService } from '@/core/QueryService.js';
import type { ChannelsRepository } from '@/models/index.js';
import { ChannelEntityService } from '@/core/entities/ChannelEntityService.js';
import { DI } from '@/di-symbols.js';
import { safeForSql } from '@/misc/safe-for-sql.js';
import { normalizeForSearch } from '@/misc/normalize-for-search.js';

export const meta = {
	tags: ['channels'],

	requireCredential: false,

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
		tags: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
		sinceId: { type: 'string', format: 'misskey:id' },
		untilId: { type: 'string', format: 'misskey:id' },
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 5 },
	},
	required: ['tags'],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.channelsRepository)
		private channelsRepository: ChannelsRepository,

		private channelEntityService: ChannelEntityService,
		private queryService: QueryService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const query = this.queryService.makePaginationQuery(this.channelsRepository.createQueryBuilder('channel'), ps.sinceId, ps.untilId)
				.andWhere(new Brackets(qb => { qb
					.where('channel.isPrivate = FALSE')
					.orWhere(new Brackets(qb2 => { qb2
						.where('channel.isPrivate = TRUE')
						.andWhere(new Brackets(qb3 => { qb3
							.where(':id = ANY(channel.privateUserIds)', { id: me?.id })
							.orWhere(':id = ANY(channel.moderatorUserIds)', { id: me?.id })
							.orWhere('channel.userId = :id', { id: me?.id });
						}));
					}));
				}))
				.andWhere('channel.isArchived = FALSE');

			// 指定したタグで検索
			query.andWhere(new Brackets(qb => {
				for (const tag of ps.tags) {
					if (!safeForSql(normalizeForSearch(tag))) continue;
					qb.orWhere(new Brackets(qb2 => {
						qb2.where('note.userHost IS NULL');
						qb2.andWhere(`'{"${normalizeForSearch(tag)}"}' <@ note.tags`);
					}));
				}
			}));

			const channels = await query
				.limit(ps.limit)
				.getMany();

			return await Promise.all(channels.map(x => this.channelEntityService.pack(x, me)));
		});
	}
}
