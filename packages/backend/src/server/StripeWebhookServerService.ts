import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import type { RolesRepository, UserProfilesRepository } from '@/models/_.js';
import { RoleService } from '@/core/RoleService.js';
import { MetaService } from '@/core/MetaService.js';
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { bindThis } from "@/decorators.js";
import { Stripe } from "stripe";
import { LoggerService } from "@/core/LoggerService.js";
import type Logger from "@/logger.js";

@Injectable()
export class StripeWebhookServerService {
	private logger: Logger;

	constructor(
		@Inject(DI.config)
		private config: Config,
		@Inject(DI.usersRepository)
		private userProfilesRepository: UserProfilesRepository,
		@Inject(DI.rolesRepository)
		private rolesRepository: RolesRepository,
		private roleService: RoleService,
		private metaService: MetaService,
		private loggerService: LoggerService,
	) {
		this.logger = this.loggerService.getLogger('server', 'gray', false);
	}

	@bindThis
	public createServer(fastify: FastifyInstance, options: FastifyPluginOptions, done: (err?: Error) => void) {
		fastify.post('/webhook', async (request, reply) => {
			const instance = await this.metaService.fetch(true);
			if (!(instance.enableSubscriptions && this.config.stripe?.secretKey)) {
				return reply.code(503);
			}

			const stripe = new Stripe(this.config.stripe.secretKey);

			const body = request.rawBody;

			if (!body) {
				return reply.code(400);
			}

			// Check if webhook signing is configured.
			if (this.config.stripe.webhookSecret) {
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

						const customer = subscription.customer as Stripe.Customer;
						const subscribeUser = await this.userProfilesRepository.findOneByOrFail({ stripeCustomerId: customer.id });

						if (!subscribeUser) {
							return reply.code(404);
						}

						const plan = subscription.items.data[0].plan as Stripe.Plan;
						const role = await this.rolesRepository.findOneByOrFail({ stripeProductId: plan.product as string });
						await this.roleService.assign(subscribeUser.userId, role.id);

						return reply.code(200);
					}

					case 'customer.subscription.deleted': {
						// Delete the subscription.
						const subscription = event.data.object;

						const customer = subscription.customer as Stripe.Customer;
						const subscribeUser = await this.userProfilesRepository.findOneByOrFail({ stripeCustomerId: customer.id });

						if (!subscribeUser) {
							return reply.code(404);
						}

						const plan = subscription.items.data[0].plan as Stripe.Plan;
						const role = await this.rolesRepository.findOneByOrFail({ stripeProductId: plan.product as string });

						await this.roleService.unassign(subscribeUser.userId, role.id);
						return reply.code(200);
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
	}
}
