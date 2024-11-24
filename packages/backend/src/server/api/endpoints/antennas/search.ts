import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type { AntennasRepository } from "@/models/index.js";
import type { AntennaEntityService } from "@/core/entities/AntennaEntityService.js";
import type { QueryService } from "@/core/QueryService.js";
import { DI } from "@/di-symbols.js";
import { sqlLikeEscape } from "@/misc/sql-like-escape.js";

export const meta = {
	tags: ["antennas", "account"],

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
			ref: "Antenna",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		query: { type: "string" },
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
		@Inject(DI.antennasRepository)
		private antennasRepository: AntennasRepository,

		@Inject(DI.antennaEntityService)
		private antennaEntityService: AntennaEntityService,

		@Inject(DI.queryService)
		private queryService: QueryService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const query = this.queryService
				.makePaginationQuery(
					this.antennasRepository.createQueryBuilder("antenna"),
					ps.sinceId,
					ps.untilId,
				)
				.andWhere("antenna.public = TRUE OR antenna.userId = :userId", {
					userId: me.id,
				});

			if (ps.query !== "") {
				query.andWhere("antenna.name ILIKE :q", {
					q: `%${sqlLikeEscape(ps.query)}%`,
				});
			}
			const antennas = await query.limit(ps.limit).getMany();

			return await Promise.all(
				antennas.map((x) => this.antennaEntityService.pack(x)),
			);
		});
	}
}
