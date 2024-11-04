import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { UserPointService } from "@/core/entities/UserPointService.js";
import type { UserPointsRepository } from "@/models/Repositories.js";
import { DI } from "@/di-symbols.js";

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
		userId: { type: "string", format: "misskey:id" },
		value: { type: "number" },
	},
	required: ["userId", "value"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(private userPointService: UserPointService) {
		super(meta, paramDef, async (ps, me) => {
			return await userPointService.send(me.id, ps.userId, ps.value);
		});
	}
}
