import { Inject, Injectable } from '@nestjs/common';
import { Brackets } from 'typeorm';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { ChannelFavoritesRepository } from '@/models/index.js';
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
	},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.channelFavoritesRepository)
		private channelFavoritesRepository: ChannelFavoritesRepository,

		private channelEntityService: ChannelEntityService,
		private queryService: QueryService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const query = this.channelFavoritesRepository.createQueryBuilder('favorite')
				.andWhere('favorite.userId = :meId', { meId: me.id })
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
				.leftJoinAndSelect('favorite.channel', 'channel');

			const favorites = await query
				.getMany();

			return await Promise.all(favorites.map(x => this.channelEntityService.pack(x.channel!, me)));
		});
	}
}
