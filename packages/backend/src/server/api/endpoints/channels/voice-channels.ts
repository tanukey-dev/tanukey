import { Inject, Injectable } from '@nestjs/common';
import { Brackets } from 'typeorm';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { ChannelsRepository } from '@/models/index.js';
import { ChannelEntityService } from '@/core/entities/ChannelEntityService.js';
import { DI } from '@/di-symbols.js';

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
	properties: {},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.channelsRepository)
		private channelsRepository: ChannelsRepository,

		private channelEntityService: ChannelEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const query = this.channelsRepository.createQueryBuilder('channel')
				.andWhere('channel.isVoiceChatEnabled = TRUE')
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

			const channels = await query.take(10).getMany();

			return await Promise.all(channels.map(x => this.channelEntityService.pack(x, me)));
		});
	}
}
