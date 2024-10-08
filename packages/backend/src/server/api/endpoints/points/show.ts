import type { UserPointService } from "@/core/entities/UserPointService.js";
import { DI } from "@/di-symbols.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { Inject, Injectable } from "@nestjs/common";

export const meta = {
	tags: ["users"],

	requireCredential: true,
	kind: "read:account",

	errors: {
		noSuchUser: {
			message: "No such user.",
			code: "NO_SUCH_USER",
			id: "4362f8dc-731f-4ad8-a694-be5a88922a24",
			httpStatusCode: 404,
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		userId: { type: "string", format: "misskey:id", nullable: true },
	},
	required: [],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.userPointService)
		private userPointService: UserPointService,
	) {
		super(meta, paramDef, async (ps, me) => {
			if (ps.userId) {
				return await userPointService.pack(ps.userId);
			}
			return await userPointService.pack(me.id);
		});
	}
}
