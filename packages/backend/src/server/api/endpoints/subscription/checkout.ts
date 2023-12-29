import ms from 'ms';
import { Stripe } from 'stripe';
import { Inject, Injectable } from '@nestjs/common';
import type { UserProfilesRepository, RolesRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
import { RoleService } from '@/core/RoleService.js';
import { MetaService } from '@/core/MetaService.js';
import type { Config } from '@/config.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['subscription'],

	requireCredential: true,
	kind: 'write:account',

	limit: {
		duration: ms('1hour'),
		max: 10,
		minInterval: ms('1sec'),
	},

	errors: {
		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: '6a27f458-92aa-4807-bbc3-3b8223a84a7e',
		},

		noSuchRole: {
			message: 'No such role.',
			code: 'NO_SUCH_ROLE',
			id: 'eb70323a-df61-4dd4-ad90-89c83c7cf26e',
		},

		noSuchSubscription: {
			message: 'No such subscription.',
			code: 'NO_SUCH_SUBSCRIPTION',
			id: 'f8b5f1c0-7d1c-4a5b-9d9d-1d4d7e0c8e3a',
		},

		accessDenied: {
			message: 'Access denied.',
			code: 'ACCESS_DENIED',
			id: 'fe8d7103-0ea8-4ec3-814d-f8b401dc69e9',
		},

		requiredEmail: {
			message: 'Email is required.',
			code: 'REQUIRED_EMAIL',
			id: 'f1b0a9f3-9f8a-4e8c-9b4d-0d2c1b7a9c0b',
		},

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
		private roleService: RoleService,
		private metaService: MetaService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const instance = await this.metaService.fetch(true);
			if (!(instance.enableSubscriptions && this.config.stripe?.secretKey)) {
				throw new ApiError(meta.errors.unavailable);
			}

			const stripe = new Stripe(this.config.stripe.secretKey);

			let subscribeUser = await this.userProfilesRepository.findOneBy({ userId: me.id });
			if (!subscribeUser) {
				throw new ApiError(meta.errors.noSuchUser);
			}
			if (!subscribeUser.email) {
				throw new ApiError(meta.errors.requiredEmail);
			}

			if (!subscribeUser.stripeCustomerId) {
				const makeCustomer = await stripe.customers.create({
					email: subscribeUser.email,
				});
				await this.userProfilesRepository.update({ userId: me.id }, {
					stripeCustomerId: makeCustomer.id,
				});
				subscribeUser = await this.userProfilesRepository.findOneByOrFail({ userId: me.id });
			}

			const role = await this.rolesRepository.findOneBy({ id: ps.roleId });
			if (!role) {
				throw new ApiError(meta.errors.noSuchRole);
			}
			if (!role.stripeProductId) {
				throw new ApiError(meta.errors.noSuchSubscription);
			}

			const session = await stripe.checkout.sessions.create({
				mode: 'subscription',
				billing_address_collection: 'auto',
				line_items: [
					{
						price: role.stripeProductId,
						quantity: 1,
					},
				],
				success_url: `${this.config.url}/subscription/success`,
				cancel_url: `${this.config.url}/subscription/cancel`,
				customer: subscribeUser.stripeCustomerId ?? undefined,
			}, {});

			return {
				redirect: {
					permanent: false,
					destination: session.url,
				},
			};
		});
	}
}
