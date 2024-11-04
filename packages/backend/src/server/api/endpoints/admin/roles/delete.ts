import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type { RolesRepository } from "@/models/Repositories.js";
import { GlobalEventService } from "@/core/GlobalEventService.js";
import type { SubscriptionPlansRepository } from "@/models/Repositories.js";
import { DI } from "@/di-symbols.js";
import { ApiError } from "@/server/api/error.js";

export const meta = {
	tags: ["admin", "role"],

	requireCredential: true,
	requireAdmin: true,
	kind: "write:admin:roles",

	errors: {
		noSuchRole: {
			message: "No such role.",
			code: "NO_SUCH_ROLE",
			id: "de0d6ecd-8e0a-4253-88ff-74bc89ae3d45",
		},

		inUseRole: {
			message: "Role is in use.",
			code: "IN_USE_ROLE",
			id: "c1d8e1a8-0d7f-4a5c-8f8e-9e6f6f1e4a7a",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		roleId: { type: "string", format: "misskey:id" },
	},
	required: ["roleId"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.rolesRepository)
		private rolesRepository: RolesRepository,
		@Inject(DI.subscriptionPlansRepository)
		private subscriptionPlansRepository: SubscriptionPlansRepository,

		private globalEventService: GlobalEventService,
	) {
		super(meta, paramDef, async (ps, me) => {
			if (
				!(await subscriptionPlansRepository.exist({
					where: {
						roleId: ps.roleId,
					},
				}))
			) {
				throw new ApiError(meta.errors.inUseRole);
			}

			const role = await this.rolesRepository.findOneBy({ id: ps.roleId });
			if (role == null) {
				throw new ApiError(meta.errors.noSuchRole);
			}
			await this.rolesRepository.delete({
				id: ps.roleId,
			});
			this.globalEventService.publishInternalEvent("roleDeleted", role);
		});
	}
}
