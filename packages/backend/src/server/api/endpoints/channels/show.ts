import { Inject, Injectable } from '@nestjs/common';
import { Brackets, In } from 'typeorm';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { Channel, ChannelsRepository } from '@/models/index.js';
import { ChannelEntityService } from '@/core/entities/ChannelEntityService.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['channels'],

	requireCredential: false,

	res: {
		optional: false, nullable: false,
		oneOf: [
			{
				type: 'object',
				ref: 'Channel',
			},
			{
				type: 'array',
				items: {
					type: 'object',
					ref: 'Channel',
				},
			},
		],
	},

	errors: {
		noSuchChannel: {
			message: 'No such channel.',
			code: 'NO_SUCH_CHANNEL',
			id: '6f6c314b-7486-4897-8966-c04a66a02923',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		channelId: { type: 'string', format: 'misskey:id' },
		channelIds: { type: 'array', uniqueItems: true, items: {
			type: 'string', format: 'misskey:id',
		} },
	},
	anyOf: [
		{ required: ['channelId'] },
		{ required: ['channelIds'] },
	],
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
			if (ps.channelIds) {
				const channels = await this.channelsRepository.createQueryBuilder('channel')
					.where({ id: In(ps.channelIds) })
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
					.andWhere('channel.isArchived = FALSE')
					.getMany();

				// リクエストされた通りに並べ替え
				const _channels: Channel[] = [];
				for (const id of ps.channelIds) {
					_channels.push(channels.find(x => x.id === id)!);
				}

				return await Promise.all(_channels.map(x => this.channelEntityService.pack(x, me)));
			} else {
				const channel = await this.channelsRepository.findOneBy({
					id: ps.channelId,
				});

				if (channel == null || (me && channel.isPrivate && !(channel.userId === me.id || channel.moderatorUserIds.includes(me.id) || channel.privateUserIds.includes(me.id)))) {
					throw new ApiError(meta.errors.noSuchChannel);
				}

				return await this.channelEntityService.pack(channel, me, true);
			}
		});
	}
}
