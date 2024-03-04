import { Inject, Injectable } from '@nestjs/common';
import { Endpoint } from "@/server/api/endpoint-base.js";
import { DI } from '@/di-symbols.js';
import { ApiError } from '../../error.js';
import type { SubscriptionStatusesRepository, UsersRepository } from '@/models/index.js';
import { MetaService } from "@/core/MetaService.js";
import { IdService } from '@/core/IdService.js';
import { SubscriptionStatus } from '@/models/entities/SubscriptionStatus.js';

export const meta = {
	tags: ['subscription'],

	requireCredential: true,
	kind: 'read:account',

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
	properties: {},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,
		@Inject(DI.subscriptionStatusesRepository)
		private subscriptionStatusesRepository: SubscriptionStatusesRepository,
		private idService: IdService,
		private metaService: MetaService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const instance = await this.metaService.fetch(true);
			if (!instance.enableSubscriptions) {
				throw new ApiError(meta.errors.unavailable);
			}

			const statuses = await subscriptionStatusesRepository.createQueryBuilder('status')
				.where('status.userId = :userId', { userId: me.id })
				.getMany() as SubscriptionStatus[];

			// 旧実装からのデータ移行
			const user = await this.usersRepository.findOneByOrFail({ id: me.id });
			if (user.subscriptionPlanId) {
				const current = statuses.filter(s => s.userId === user.id && s.planId === user.subscriptionPlanId);
				if (current.length === 0) {
					await this.subscriptionStatusesRepository.insert({
						id: this.idService.genId(),
						userId: user.id,
						planId: user.subscriptionPlanId,
						status: user.subscriptionStatus,
					});
				}
				await this.usersRepository.update({ id: user.id }, {
					subscriptionPlanId: null,
					subscriptionStatus: 'none',
					stripeSubscriptionId: null,
				});
			}

			return statuses;
		});
	}
}
