import { Inject, Injectable } from "@nestjs/common";
import { Brackets } from "typeorm";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { QueryService } from "@/core/QueryService.js";
import type { EventsRepository } from "@/models/Repositories.js";
import { EventEntityService } from "@/core/entities/EventEntityService.js";
import { DI } from "@/di-symbols.js";
import { sqlLikeEscape } from "@/misc/sql-like-escape.js";

export const meta = {
	tags: ["events"],

	requireCredential: true,
	kind: "read:account",

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "Event",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		query: { type: "string" },
		type: {
			type: "string",
			enum: ["nameAndDescription", "nameOnly"],
			default: "nameAndDescription",
		},
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 5 },
	},
	required: ["query"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.eventsRepository)
		private eventsRepository: EventsRepository,

		private eventEntityService: EventEntityService,
		private queryService: QueryService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const query = this.queryService
				.makePaginationQuery(
					this.eventsRepository.createQueryBuilder("event"),
					ps.sinceId,
					ps.untilId,
				)
				.andWhere("event.isArchived = FALSE");

			if (ps.query !== "") {
				if (ps.type === "nameAndDescription") {
					query.andWhere(
						new Brackets((qb) => {
							qb.where("event.name ILIKE :q", {
								q: `%${sqlLikeEscape(ps.query)}%`,
							}).orWhere("event.description ILIKE :q", {
								q: `%${sqlLikeEscape(ps.query)}%`,
							});
						}),
					);
				} else {
					query.andWhere("event.name ILIKE :q", {
						q: `%${sqlLikeEscape(ps.query)}%`,
					});
				}
			}

			const channels = await query.limit(ps.limit).getMany();

			return await Promise.all(
				channels.map((x) => this.eventEntityService.pack(x, me)),
			);
		});
	}
}
