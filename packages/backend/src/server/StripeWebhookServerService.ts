import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import type { UsersRepository, UserProfilesRepository, SubscriptionPlansRepository } from '@/models/index.js';
import { RoleService } from '@/core/RoleService.js';
import { MetaService } from '@/core/MetaService.js';
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { bindThis } from "@/decorators.js";
import { Stripe } from "stripe";
import { LoggerService } from "@/core/LoggerService.js";
import type Logger from "@/logger.js";
import { UserEntityService } from "@/core/entities/UserEntityService.js";
import { GlobalEventService } from "@/core/GlobalEventService.js";

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
		private roleService: RoleService,
		private metaService: MetaService,
		private userEntityService: UserEntityService,
		private globalEventService: GlobalEventService,
		private loggerService: LoggerService,
	) {
		this.logger = this.loggerService.getLogger('server', 'gray', false);
	}

	@bindThis
	public createServer(fastify: FastifyInstance, options: FastifyPluginOptions, done: (err?: Error) => void) {
		fastify.addContentTypeParser(
			"application/json",
			{ parseAs: "buffer" },
			function (_req, body, done) {
				try {
					done(null, body)
				} catch (err: any) {
					err.statusCode = 400;
					return done(err);
				}
			}
		)

		fastify.post('/webhook', { config: { rawBody: true }, bodyLimit: 1024 * 64 }, async (request, reply) => {
			const instance = await this.metaService.fetch(true);
			if (!(instance.enableSubscriptions || this.config.stripe?.secretKey)) {
				return reply.code(503);
			}

			const stripe = new Stripe(this.config.stripe!.secretKey);

			const body = request.rawBody;
			if (!body) {
				return reply.code(400);
			}

			// Check if webhook signing is configured.
			if (this.config.stripe?.webhookSecret) {
				// Retrieve the event by verifying the signature using the raw body and secret.
				let event;
				const signature = request.headers['stripe-signature'];
				if (!signature) { // Check if signature exists.
					return reply.code(400);
				}

				try {
					event = stripe.webhooks.constructEvent(body, signature, this.config.stripe.webhookSecret);
				} catch (err) {
					return reply.code(400);
				}

				// Handle the event.
				switch (event.type) {
					case 'customer.subscription.created': {
						// Payment is successful and the subscription is created.
						// You should provision the subscription and save the customer ID to your database.
						const subscription = event.data.object;

						const customer = subscription.customer as string;
						const userProfile = await this.userProfilesRepository.findOneByOrFail({ stripeCustomerId: customer });

						if (!userProfile) {
							return reply.code(400);
						}
						reply.code(200); // 200を返すと、Stripeからのリクエストを受け取ったとみなされる。このタイミングで200を返さないと、Stripeからのリクエストがタイムアウトしてしまう。

						const subscriptionPlan = await this.subscriptionPlansRepository.findOneByOrFail({ stripePriceId: subscription.items.data[0].plan.id });
						await this.roleService.assign(userProfile.userId, subscriptionPlan.roleId);
						await this.usersRepository.update({id: userProfile.userId}, {
							subscriptionStatus: subscription.status,
							subscriptionPlanId: subscriptionPlan.id,
						});

						// Publish meUpdated event
						this.globalEventService.publishMainStream(userProfile.userId, 'meUpdated', await this.userEntityService.pack(userProfile.userId, { id: userProfile.userId }, {
							detail: true,
							includeSecrets: true
						}));

						return;
					}

					case 'customer.subscription.deleted': {
						// Delete the subscription.
						const subscription = event.data.object;

						const customer = subscription.customer as string;
						const userProfile = await this.userProfilesRepository.findOneByOrFail({ stripeCustomerId: customer });

						if (!userProfile) {
							return reply.code(400);
						}
						reply.code(200); // 200を返すと、Stripeからのリクエストを受け取ったとみなされる。このタイミングで200を返さないと、Stripeからのリクエストがタイムアウトしてしまう。

						const subscriptionPlan = await this.subscriptionPlansRepository.findOneByOrFail({ stripePriceId: subscription.items.data[0].plan.id });
						await this.roleService.unassign(userProfile.userId, subscriptionPlan.roleId);
						await this.usersRepository.update({ id: userProfile.userId }, {
							subscriptionStatus: subscription.status,
							subscriptionPlanId: null,
						});

						// Publish meUpdated event
						this.globalEventService.publishMainStream(userProfile.userId, 'meUpdated', await this.userEntityService.pack(userProfile.userId, { id: userProfile.userId }, {
							detail: true,
							includeSecrets: true
						}));

						return;
					}

					case 'customer.subscription.updated': {
						// Update the subscription.
						const subscription = event.data.object;

						const customer = subscription.customer as string;
						const userProfile = await this.userProfilesRepository.findOneByOrFail({ stripeCustomerId: customer });

						if (!userProfile) {
							return reply.code(400);
						}
						reply.code(200); // 200を返すと、Stripeからのリクエストを受け取ったとみなされる。このタイミングで200を返さないと、Stripeからのリクエストがタイムアウトしてしまう。

						const user = await this.usersRepository.findOneByOrFail({ id: userProfile.userId });
						const subscriptionPlan = await this.subscriptionPlansRepository.findOneByOrFail({ stripePriceId: subscription.items.data[0].plan.id });
						if (subscriptionPlan.id !== user.subscriptionPlanId) {
							// サブスクリプションプランが変更された場合
							const oldSubscriptionPlan = await this.subscriptionPlansRepository.findOneByOrFail({ id: user.subscriptionPlanId ?? undefined });
							await this.roleService.unassign(user.id, oldSubscriptionPlan.roleId);

							await this.roleService.assign(user.id, subscriptionPlan.roleId);
							await this.usersRepository.update({ id: user.id }, {
								subscriptionStatus: subscription.status,
								subscriptionPlanId: subscriptionPlan.id,
							});
						} else {
							await this.usersRepository.update({ id: user.id }, {
								subscriptionStatus: subscription.status,
							});
						}

						// Publish meUpdated event
						this.globalEventService.publishMainStream(user.id, 'meUpdated', await this.userEntityService.pack(user.id, user, {
							detail: true,
							includeSecrets: true
						}));

						return;
					}

					case 'invoice.upcoming': {
						// TODO サブスクリプションプランがアーカイブ状態になっていないかチェックする。
						// アーカイブになっている場合は、サブスクリプションをキャンセルする。
						break;
					}

					case 'invoice.paid':
						// Continue to provision the subscription as payments continue to be made.
						// Store the status in your database and check when a user accesses your service.
						// This approach helps you avoid hitting rate limits.
						break;

					case 'invoice.payment_failed':
						// TODO 保留中の支払いを記録する処理を書く
						// The payment failed or the customer does not have a valid payment method.
						// The subscription becomes past_due. Notify your customer and send them to the
						// customer portal to update their payment information.
						break;
					default:
						// Unhandled event type.
						return reply.code(400);
				}
			} else {
				/* TODO いつかちゃんと実装する
				// Webhook signing is recommended, but if the secret is not configured in `config.js`,
				// retrieve the event data directly from the request body.
				let dataObject = request.body.data;
				// Handle the event.
				switch (request.body.type) {
					case 'checkout.session.completed':
						// Payment is successful and the subscription is created.
						// You should provision the subscription and save the customer ID to your database.
						break;
					case 'invoice.paid':
						// Continue to provision the subscription as payments continue to be made.
						// Store the status in your database and check when a user accesses your service.
						// This approach helps you avoid hitting rate limits.
						break;
					case 'invoice.payment_failed':
						// The payment failed or the customer does not have a valid payment method.
						// The subscription becomes past_due. Notify your customer and send them to the
						// customer portal to update their payment information.
						break;
					default:
				 */
			}
		});

		done();
	}
}
