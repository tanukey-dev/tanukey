import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type { SubscriptionPlansRepository } from "@/models/_.js";
import { DI } from "@/di-symbols.js";

export const meta = {
	tags: ['subscription-plans'],

	requireCredential: false,

	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
			items: {
				ref: 'SubscriptionPlan',
			},
		},
	}
} as const;

export const paramDef = {
	type: 'object',
	properties: {
	},
	required: [
	],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.subscriptionPlansRepository)
		private subscriptionPlansRepository: SubscriptionPlansRepository,
	) {
		super(meta, paramDef, async (ps) => {
			const subscriptionPlans = await this.subscriptionPlansRepository.find();
			return subscriptionPlans.map(subscriptionPlan => (
				{
					id: subscriptionPlan.id,
					name: subscriptionPlan.name,
					stripePriceId: subscriptionPlan.stripePriceId,
					roleId: subscriptionPlan.roleId,
				}
			));
		});
	}
}
