/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { UsersRepository } from '@/models/_.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DeleteAccountService } from '@/core/DeleteAccountService.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from "@/server/api/error.js";

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireAdmin: true,
	kind: 'write:admin:delete-account',

	errors: {
		subscriptionIsActive: {
			message: 'If Subscription is active, cannot move account.',
			code: 'SUBSCRIPTION_IS_ACTIVE',
			id: 'f5c8b3b4-9e4d-4b7f-9f4d-9f1f0a7a3d0a',
		},
	}
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		userId: { type: 'string', format: 'misskey:id' },
	},
	required: ['userId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		private deleteAccountService: DeleteAccountService,
	) {
		super(meta, paramDef, async (ps) => {
			const user = await this.usersRepository.findOneByOrFail({ id: ps.userId });
			if (!(user.subscriptionStatus === 'unpaid' || user.subscriptionStatus === 'canceled' || user.subscriptionStatus === 'none')) {
				throw new ApiError(meta.errors.subscriptionIsActive);
			}

			if (user.isDeleted) {
				return;
			}

			await this.deleteAccountService.deleteAccount(user);
		});
	}
}
