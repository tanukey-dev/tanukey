import { Inject, Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import type { UsersRepository, UserProfilesRepository, SubscriptionPlansRepository, UserProfile, SubscriptionStatusesRepository } from '@/models/index.js';
import { RoleService } from '@/core/RoleService.js';
import { MetaService } from '@/core/MetaService.js';
import { bindThis } from '@/decorators.js';
import { LoggerService } from '@/core/LoggerService.js';
import { IdService } from '@/core/IdService.js';
import type Logger from '@/logger.js';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

@Injectable()
export class StripeWebhookServerService {
	private logger: Logger;

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
		private roleService: RoleService,
		private metaService: MetaService,
		private idService: IdService,
		private loggerService: LoggerService,
	) {
		this.logger = this.loggerService.getLogger('server', 'gray', false);
	}

	@bindThis
	public createServer(fastify: FastifyInstance, options: FastifyPluginOptions, done: (err?: Error) => void) {
		fastify.addContentTypeParser(
			'application/json',
			{ parseAs: 'buffer' },
			(_req, body, done) => {
				try {
					done(null, body);
				} catch (err: any) {
					err.statusCode = 400;
					return done(err);
				}
			},
		);

		fastify.post('/webhook', { config: { rawBody: true }, bodyLimit: 1024 * 64 }, async (request, reply) => {
			const instance = await this.metaService.fetch(true);
			if (!(instance.enableSubscriptions)) {
				return reply.code(503);
			}
			if (!(this.config.stripe && this.config.stripe.secretKey && this.config.stripe.webhookSecret)) {
				return reply.code(503);
			}

			const body = request.rawBody;
			if (!body) {
				return reply.code(400);
			}

			// Retrieve the event by verifying the signature using the raw body and secret.
			const signature = request.headers['stripe-signature'];
			if (!signature) { // Check if signature exists.
				return reply.code(400);
			}

			const stripe = new Stripe(this.config.stripe.secretKey);
			let event;
			try {
				event = stripe.webhooks.constructEvent(body, signature, this.config.stripe.webhookSecret);
			} catch (err) {
				return reply.code(400);
			}

			// イベント処理前の共通処理（例：ユーザープロファイルの取得と初期応答の設定）
			const preprocessEvent = async (eventData: any): Promise<{ userProfile: UserProfile, subscription: any }> => {
				const customer = eventData.customer as string;
				const userProfile = await this.userProfilesRepository.findOneBy({ stripeCustomerId: customer });

				if (!userProfile) {
					return reply.code(400);
				}
				return { userProfile, subscription: eventData };
			};

			const { userProfile, subscription } = await preprocessEvent(event.data.object);
			const user = await this.usersRepository.findOneByOrFail({ id: userProfile.userId });

			// Handle the event.
			switch (event.type) {
				case 'customer.subscription.created': { // サブスクリプションが新規に作成された場合
					reply.code(204); // Stripeへの応答を設定
					return;
				}

				case 'customer.subscription.updated': { // Update the subscription.
					const subscriptionPlan = await this.subscriptionPlansRepository.findOneByOrFail({ stripePriceId: subscription.items.data[0].plan.id });

					if (subscription.cancel_at_period_end) {
						reply.code(204); // Stripeへの応答を設定
						return; // キャンセルされた場合は期限切れのタイミングでcustomer.subscription.deletedイベントが発生するので、ここでは何もしない
					}

					if (subscription.status === 'active') {
						await this.roleService.getUserRoles(user.id).then(async (roles) => {
							// ユーザーにロールが割り当てられていない場合、ロールを割り当てる
							if (!roles.some((role) => role.id === subscriptionPlan.roleId)) {
								await this.roleService.assign(user.id, subscriptionPlan.roleId);
							}
						});
					}

					// ユーザーのサブスクリプションステータスとサブスクリプションプランを更新する
					const status = await this.subscriptionStatusesRepository.createQueryBuilder('status')
						.andWhere('status.userId = :userId', { userId: user.id })
						.andWhere('status.planId = :planId', { planId: subscriptionPlan.id })
						.getOne();
					if (status) {
						await this.subscriptionStatusesRepository.update({ id: status.id }, {
							status: subscription.status,
						});
					} else {
						await this.subscriptionStatusesRepository.insert({
							id: this.idService.genId(),
							userId: user.id,
							planId: subscriptionPlan.id,
							status: subscription.status,
						});
					}

					reply.code(204); // Stripeへの応答を設定
					return;
				}

				case 'customer.subscription.deleted': { // Delete the subscription.
					const subscriptionPlan = await this.subscriptionPlansRepository.findOneByOrFail({ stripePriceId: subscription.items.data[0].plan.id });

					// サブスクリプションプランのロールが割り当てられている場合、ロールを解除する
					await this.roleService.getUserRoles(userProfile.userId).then(async (roles) => {
						if (roles.some((role) => role.id === subscriptionPlan.roleId)) {
							await this.roleService.unassign(userProfile.userId, subscriptionPlan.roleId);
						}
					});

					const status = await this.subscriptionStatusesRepository.createQueryBuilder('status')
						.andWhere('status.userId = :userId', { userId: user.id })
						.andWhere('status.planId = :planId', { planId: subscriptionPlan.id })
						.getOneOrFail();

					await this.subscriptionStatusesRepository.update({ id: status.id }, {
						status: subscription.status,
					});

					reply.code(204); // Stripeへの応答を設定
					return;
				}
				default:
					// Unhandled event type.
					return reply.code(400);
			}
		});

		done();
	}
}
