import ms from 'ms';
import { Stripe } from 'stripe';
import { Inject, Injectable } from '@nestjs/common';
import type {
	UsersRepository,
	UserProfilesRepository,
	SubscriptionPlansRepository,
} from '@/models/index.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
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

		noSuchPlan: {
			message: 'No such plan.',
			code: 'NO_SUCH_PLAN',
			id: 'd9f0d5c1-0b5b-4b7a-9d2c-1c1c5c6d1d1d',
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
		planId: { type: 'string', format: 'misskey:id' },
	},
	required: ['planId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.config)
		private config: Config,
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,
		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,
		@Inject(DI.subscriptionPlansRepository)
		private subscriptionPlanRepository: SubscriptionPlansRepository,
		private metaService: MetaService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const instance = await this.metaService.fetch(true);
			if (!(instance.enableSubscriptions || this.config.stripe?.secretKey)) {
				throw new ApiError(meta.errors.unavailable);
			}

			const plan = await this.subscriptionPlanRepository.findOneBy({ id: ps.planId });
			if (plan?.isArchived || !plan?.stripePriceId) {
				throw new ApiError(meta.errors.noSuchPlan);
			}

			const user = await this.usersRepository.findOneByOrFail({ id: me.id });
			let userProfile = await this.userProfilesRepository.findOneBy({ userId: me.id });
			if (!user || !userProfile) {
				throw new ApiError(meta.errors.noSuchUser);
			}
			if (!userProfile.email) {
				throw new ApiError(meta.errors.requiredEmail);
			}

			const stripe = new Stripe(this.config.stripe!.secretKey);
			if (!userProfile.stripeCustomerId) {
				const makeCustomer = await stripe.customers.create({
					email: userProfile.email,
				});
				await this.userProfilesRepository.update({ userId: user.id }, {
					stripeCustomerId: makeCustomer.id,
				});
				userProfile = await this.userProfilesRepository.findOneByOrFail({ userId: user.id });
			}

			const subscriptionStatus = user.subscriptionStatus;
			if (subscriptionStatus === 'active') {
				throw new ApiError(meta.errors.accessDenied);
			} else if (subscriptionStatus === 'incomplete' || subscriptionStatus === 'incomplete_expired' || subscriptionStatus === 'past_due' || subscriptionStatus === 'unpaid') {
				const session = await stripe.checkout.sessions.create({
					customer: userProfile.stripeCustomerId ?? undefined,
					return_url: `${this.config.url}/subscription/success`,
				}, {});

				return {
					redirect: {
						permanent: false,
						destination: session.url,
					},
				};
			} else { // null or 'canceled' or 'none'
				const session = await stripe.checkout.sessions.create({
					mode: 'subscription',
					billing_address_collection: 'auto',
					line_items: [
						{
							price: plan.stripePriceId,
							quantity: 1,
						},
					],
					success_url: `${this.config.url}/subscription/success`,
					cancel_url: `${this.config.url}/subscription/cancel`,
					customer: userProfile.stripeCustomerId ?? undefined,
				});

				return {
					redirect: {
						permanent: false,
						destination: session.url,
					},
				};
			}
		});
	}
}
