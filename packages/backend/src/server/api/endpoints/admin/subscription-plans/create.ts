import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type { SubscriptionPlansRepository } from "@/models/_.js";
import { DI } from "@/di-symbols.js";
import { IdService } from "@/core/IdService.js";
import { SubscriptionPlanEntityService } from "@/core/entities/SubscriptionPlanEntityService.js";

export const meta = {
	tags: ['admin', 'subscription-plans'],

	requireCredential: true,
	requireAdmin: true,
	kind: 'write:admin:subscription-plans',
	secure: true,

	res: {
		type: 'object',
		optional: false, nullable: false,
		ref: 'SubscriptionPlan',
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		price: { type: 'integer' },
		currency: { type: 'string' },
		description: { type: 'string' },
		stripePriceId: { type: 'string' },
		roleId: { type: 'string', format: 'misskey:id' },
	},
	required: ['name', 'stripePriceId', 'roleId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.subscriptionPlansRepository)
		private subscriptionPlansRepository: SubscriptionPlansRepository,

		private subscriptionPlanEntityService: SubscriptionPlanEntityService,
		private idService: IdService,
	) {
		super(meta, paramDef, async (ps) => {
			const subscriptionPlan = await this.subscriptionPlansRepository.insert({
				id: this.idService.gen(),
				name: ps.name,
				price: ps.price,
				currency: ps.currency,
				description: ps.description,
				stripePriceId: ps.stripePriceId,
				roleId: ps.roleId,
				isArchived: false,
			}).then(x => this.subscriptionPlansRepository.findOneByOrFail(x.identifiers[0]));

			return await this.subscriptionPlanEntityService.pack(subscriptionPlan, null);
		});
	}
}
