import { Stripe } from 'stripe';
import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from "@/server/api/endpoint-base.js";
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import { ApiError } from '../../error.js';
import type { UserProfilesRepository } from "@/models/_.js";
import { MetaService } from "@/core/MetaService.js";

export const meta = {
	tags: ['subscription'],

	requireCredential: true,
	kind: 'read:account',

	errors: {
		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: '6a27f458-92aa-4807-bbc3-3b8223a84a7e',
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
	properties: {},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.config)
		private config: Config,
		@Inject(DI.usersRepository)
		private userProfilesRepository: UserProfilesRepository,
		private metaService: MetaService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const instance = await this.metaService.fetch(true);
			if (!(instance.enableSubscriptions || this.config.stripe?.secretKey)) {
				throw new ApiError(meta.errors.unavailable);
			}
			if (me.subscriptionStatus === 'none') {
				throw new ApiError(meta.errors.noSuchUser)
			}

			let subscribeUser = await this.userProfilesRepository.findOneBy({ userId: me.id });
			if (!subscribeUser || !subscribeUser.stripeCustomerId) {
				throw new ApiError(meta.errors.noSuchUser);
			}

			const stripe = new Stripe(this.config.stripe!.secretKey);
			const session = await stripe.billingPortal.sessions.create({
				customer: subscribeUser.stripeCustomerId!,
				return_url: `${this.config.url}/settings/subscription`,
			});

			return {
				redirect: {
					permanent: false,
					destination: session.url,
				},
			};
		});
	}
}
