import { Inject, Injectable } from "@nestjs/common";
import type { RolesRepository } from "@/models/Repositories.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { DI } from "@/di-symbols.js";
import { RoleEntityService } from "@/core/entities/RoleEntityService.js";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["role", "users"],

	requireCredential: false,

	errors: {
		noSuchRole: {
			message: "No such role.",
			code: "NO_SUCH_ROLE",
			id: "de5502bf-009a-4639-86c1-fec349e46dcb",
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

		private roleEntityService: RoleEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const role = await this.rolesRepository.findOneBy({
				id: ps.roleId,
				isPublic: true,
			});

			if (role == null) {
				throw new ApiError(meta.errors.noSuchRole);
			}

			return await this.roleEntityService.pack(role, me);
		});
	}
}
