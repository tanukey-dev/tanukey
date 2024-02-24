import bcrypt from 'bcryptjs';
import { Inject, Injectable } from '@nestjs/common';
import type { UsersRepository, UserProfilesRepository } from '@/models/index.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { DeleteAccountService } from '@/core/DeleteAccountService.js';
import { DI } from '@/di-symbols.js';
import { ApiError } from "@/server/api/error.js";

export const meta = {
	requireCredential: true,

	errors: {
		subscriptionIsActive: {
			message: 'If Subscription is active, cannot move account.',
			code: 'SUBSCRIPTION_IS_ACTIVE',
			id: 'f5c8b3b4-9e4d-4b7f-9f4d-9f1f0a7a3d0a',
		},
	},

	secure: true,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		password: { type: 'string' },
	},
	required: ['password'],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		private deleteAccountService: DeleteAccountService,
	) {
		super(meta, paramDef, async (ps, me) => {
			if (!(me.subscriptionStatus === 'unpaid' || me.subscriptionStatus === 'canceled' || me.subscriptionStatus === 'none')) {
				throw new ApiError(meta.errors.subscriptionIsActive);
			}

			const profile = await this.userProfilesRepository.findOneByOrFail({ userId: me.id });
			const userDetailed = await this.usersRepository.findOneByOrFail({ id: me.id });
			if (userDetailed.isDeleted) {
				return;
			}

			// Compare password
			const same = await bcrypt.compare(ps.password, profile.password!);

			if (!same) {
				throw new Error('incorrect password');
			}

			await this.deleteAccountService.deleteAccount(me);
		});
	}
}
