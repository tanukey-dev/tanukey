import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { RegistrationTicketsRepository } from '@/models/index.js';
import { InviteCodeEntityService } from '@/core/entities/InviteCodeEntityService.js';
import { DI } from '@/di-symbols.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 30 },
		offset: { type: 'integer', default: 0 },
		type: { type: 'string', enum: ['unused', 'used', 'expired', 'all'], default: 'all' },
		sort: { type: 'string', enum: ['+createdAt', '-createdAt', '+usedAt', '-usedAt'] },
	},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.registrationTicketsRepository)
		private registrationTicketsRepository: RegistrationTicketsRepository,

		private inviteCodeEntityService: InviteCodeEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const query = this.registrationTicketsRepository.createQueryBuilder('ticket')
				.leftJoinAndSelect('ticket.createdBy', 'createdBy')
				.leftJoinAndSelect('ticket.usedBy', 'usedBy');

			switch (ps.type) {
				case 'unused': query.andWhere('ticket.usedBy IS NULL'); break;
				case 'used': query.andWhere('ticket.usedBy IS NOT NULL'); break;
				case 'expired': query.andWhere('ticket.expiresAt < :now', { now: new Date() }); break;
			}

			switch (ps.sort) {
				case '+createdAt': query.orderBy('ticket.createdAt', 'DESC'); break;
				case '-createdAt': query.orderBy('ticket.createdAt', 'ASC'); break;
				case '+usedAt': query.orderBy('ticket.usedAt', 'DESC', 'NULLS LAST'); break;
				case '-usedAt': query.orderBy('ticket.usedAt', 'ASC', 'NULLS FIRST'); break;
				default: query.orderBy('ticket.id', 'DESC'); break;
			}

			query.limit(ps.limit);
			query.skip(ps.offset);

			const tickets = await query.getMany();

			return await this.inviteCodeEntityService.packMany(tickets, me);
		});
	}
}
