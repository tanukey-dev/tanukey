import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type { HashtagsRepository } from "@/models/Repositories.js";
import { DI } from "@/di-symbols.js";
import { sqlLikeEscape } from "@/misc/sql-like-escape.js";

export const meta = {
	tags: ["hashtags"],

	requireCredential: false,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "string",
			optional: false,
			nullable: false,
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		query: { type: "string" },
		offset: { type: "integer", default: 0 },
		origin: {
			type: "string",
			enum: ["local", "remote", "combined"],
			default: "combined",
		},
	},
	required: ["query"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.hashtagsRepository)
		private hashtagsRepository: HashtagsRepository,
	) {
		super(meta, paramDef, async (ps, me) => {
			const query = this.hashtagsRepository
				.createQueryBuilder("tag")
				.where("tag.name like :q", {
					q: sqlLikeEscape(ps.query.toLowerCase()) + "%",
				})
				.orderBy("tag.count", "DESC")
				.groupBy("tag.id");

			if (ps.origin === "local") {
				query.andWhere("tag.attachedLocalUsersCount > 0");
			} else if (ps.origin === "remote") {
				query.andWhere("tag.attachedRemoteUsersCount > 0");
			}

			const hashtags = await query.limit(ps.limit).offset(ps.offset).getMany();

			return hashtags.map((tag) => tag.name);
		});
	}
}
