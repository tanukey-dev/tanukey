import { Inject, Injectable } from "@nestjs/common";
import type { PagesRepository } from "@/models/Repositories.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { DI } from "@/di-symbols.js";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["pages"],

	requireCredential: true,

	kind: "write:pages",

	errors: {
		noSuchPage: {
			message: "No such page.",
			code: "NO_SUCH_PAGE",
			id: "eb0c6e1d-d519-4764-9486-52a7e1c6392a",
		},

		accessDenied: {
			message: "Access denied.",
			code: "ACCESS_DENIED",
			id: "8b741b3e-2c22-44b3-a15f-29949aa1601e",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		pageId: { type: "string", format: "misskey:id" },
	},
	required: ["pageId"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.pagesRepository)
		private pagesRepository: PagesRepository,
	) {
		super(meta, paramDef, async (ps, me) => {
			const page = await this.pagesRepository.findOneBy({ id: ps.pageId });
			if (page == null) {
				throw new ApiError(meta.errors.noSuchPage);
			}
			if (page.userId !== me.id) {
				throw new ApiError(meta.errors.accessDenied);
			}

			await this.pagesRepository.delete(page.id);
		});
	}
}
