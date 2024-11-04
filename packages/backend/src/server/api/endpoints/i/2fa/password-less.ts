import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { UserEntityService } from "@/core/entities/UserEntityService.js";
import type {
	UserProfilesRepository,
	UserSecurityKeysRepository,
} from "@/models/Repositories.js";
import { GlobalEventService } from "@/core/GlobalEventService.js";
import { DI } from "@/di-symbols.js";
import { ApiError } from "../../../error.js";

export const meta = {
	requireCredential: true,

	secure: true,

	errors: {
		noKey: {
			message: "No security key.",
			code: "NO_SECURITY_KEY",
			id: "f9c54d7f-d4c2-4d3c-9a8g-a70daac86512",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		value: { type: "boolean" },
	},
	required: ["value"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		@Inject(DI.userSecurityKeysRepository)
		private userSecurityKeysRepository: UserSecurityKeysRepository,

		private userEntityService: UserEntityService,
		private globalEventService: GlobalEventService,
	) {
		super(meta, paramDef, async (ps, me) => {
			if (ps.value === true) {
				// セキュリティキーがなければパスワードレスを有効にはできない
				const keyCount = await this.userSecurityKeysRepository.count({
					where: {
						userId: me.id,
					},
					select: {
						id: true,
						name: true,
						lastUsed: true,
					},
				});

				if (keyCount === 0) {
					await this.userProfilesRepository.update(me.id, {
						usePasswordLessLogin: false,
					});

					throw new ApiError(meta.errors.noKey);
				}
			}

			await this.userProfilesRepository.update(me.id, {
				usePasswordLessLogin: ps.value,
			});

			// Publish meUpdated event
			this.globalEventService.publishMainStream(
				me.id,
				"meUpdated",
				await this.userEntityService.pack(me.id, me, {
					detail: true,
					includeSecrets: true,
				}),
			);
		});
	}
}
