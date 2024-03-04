import ms from 'ms';
import { Stripe } from 'stripe';
import { Inject, Injectable } from '@nestjs/common';
import type { UsersRepository, UserProfilesRepository, SubscriptionPlansRepository, SubscriptionStatusesRepository } from '@/models/index.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DI } from '@/di-symbols.js';
import { MetaService } from '@/core/MetaService.js';
import type { Config } from '@/config.js';
import { IdService } from '@/core/IdService.js';
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

		alreadySubscribed: {
			message: 'Already subscribed this plan.',
			code: 'ALREADY_SUBSCRIBED',
			id: 'd9f0d5c1-0b5b-4b7a-9d2c-2c2c5c6d1d1d',
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
		private subscriptionPlansRepository: SubscriptionPlansRepository,
		@Inject(DI.subscriptionStatusesRepository)
		private subscriptionStatusesRepository: SubscriptionStatusesRepository,
		private idService: IdService,
		private metaService: MetaService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const instance = await this.metaService.fetch(true);
			if (!(instance.enableSubscriptions)) {
				throw new ApiError(meta.errors.unavailable);
			}
			if (!(this.config.stripe && this.config.stripe.secretKey)) {
				throw new ApiError(meta.errors.unavailable);
			}

			const plan = await this.subscriptionPlansRepository.findOneBy({ id: ps.planId });
			if (plan?.isArchived || !plan?.stripePriceId) {
				throw new ApiError(meta.errors.noSuchPlan);
			}

			const user = await this.usersRepository.findOneBy({ id: me.id });
			let userProfile = await this.userProfilesRepository.findOneBy({ userId: me.id });
			if (!user || !userProfile) {
				throw new ApiError(meta.errors.noSuchUser);
			}
			if (!userProfile.email) {
				throw new ApiError(meta.errors.requiredEmail);
			}

			const stripe = new Stripe(this.config.stripe.secretKey);
			if (!userProfile.stripeCustomerId) {
				const makeCustomer = await stripe.customers.create({
					email: userProfile.email,
				});
				await this.userProfilesRepository.update({ userId: user.id }, {
					stripeCustomerId: makeCustomer.id,
				});
				userProfile = await this.userProfilesRepository.findOneByOrFail({ userId: user.id });
			}

			let subscription = await subscriptionStatusesRepository.createQueryBuilder('status')
				.andWhere('status.userId = :userId', { userId: user.id })
				.andWhere('status.planId = :planId', { planId: plan.id })
				.getOne();

			// 旧実装からのデータ移行
			if (user.subscriptionPlanId) {
				if (subscription === null) {
					await this.subscriptionStatusesRepository.insert({
						id: this.idService.genId(),
						userId: user.id,
						planId: user.subscriptionPlanId,
						status: user.subscriptionStatus,
					});
					subscription = await subscriptionStatusesRepository.createQueryBuilder('status')
						.andWhere('status.userId = :userId', { userId: user.id })
						.andWhere('status.planId = :planId', { planId: plan.id })
						.getOne();
				}
				await this.usersRepository.update({ id: user.id }, {
					subscriptionPlanId: null,
					subscriptionStatus: 'none',
					stripeSubscriptionId: null,
				});
			}

			if (subscription == null || subscription.status !== 'active') {
				// 新規
				const session = await stripe.checkout.sessions.create({
					mode: 'subscription',
					billing_address_collection: 'auto',
					allow_promotion_codes: true,
					line_items: [
						{
							price: plan.stripePriceId,
							quantity: 1,
						},
					],
					success_url: `${this.config.url}/settings/subscription`,
					cancel_url: `${this.config.url}/settings/subscription`,
					customer: userProfile.stripeCustomerId ?? undefined,
				});

				return {
					redirect: {
						permanent: false,
						destination: session.url,
					},
				};
			} else {
				// アクティブの場合は管理画面に遷移
				if (!userProfile.stripeCustomerId) {
					throw new ApiError(meta.errors.noSuchUser);
				}

				const session = await stripe.billingPortal.sessions.create({
					customer: userProfile.stripeCustomerId,
					return_url: `${this.config.url}/settings/subscription`,
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
