import ms from 'ms';
import { Inject, Injectable } from '@nestjs/common';
import { IsNull, Not } from 'typeorm';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { MetaService } from '@/core/MetaService.js';
import type { RolesRepository, UserProfilesRepository } from '@/models/_.js';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import { RoleEntityService } from '@/core/entities/RoleEntityService.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['subscription'],

	requireCredential: false,

	limit: {
		duration: ms('1hour'),
		max: 10,
		minInterval: ms('1sec'),
	},

	errors: {
		unavailable: {
			message: 'Subscription unavailable.',
			code: 'UNAVAILABLE',
			id: 'ca50e7c1-2589-4360-a338-e729100af0c4',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		roleId: { type: 'string', format: 'misskey:id' },
	},
	required: ['roleId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.config)
		private config: Config,
		@Inject(DI.usersRepository)
		private userProfilesRepository: UserProfilesRepository,
		@Inject(DI.rolesRepository)
		private rolesRepository: RolesRepository,
		private roleEntityService: RoleEntityService,
		private metaService: MetaService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const instance = await this.metaService.fetch(true);
			if (!(instance.enableSubscriptions && this.config.stripe?.secretKey)) {
				throw new ApiError(meta.errors.unavailable);
			}

			const roles = await this.rolesRepository.findBy({
				stripeProductId: Not(IsNull()),
			});
			return await this.roleEntityService.packMany(roles, me);
		});
	}
}
