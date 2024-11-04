import { Inject, Injectable } from "@nestjs/common";
import { Brackets, In } from "typeorm";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type { Circle, CirclesRepository } from "@/models/Repositories.js";
import { CircleEntityService } from "@/core/entities/CircleEntityService.js";
import { DI } from "@/di-symbols.js";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["circles"],

	requireCredential: false,

	res: {
		optional: false,
		nullable: false,
		oneOf: [
			{
				type: "object",
				ref: "Circle",
			},
			{
				type: "array",
				items: {
					type: "object",
					ref: "Circle",
				},
			},
		],
	},

	errors: {
		noSuchCircle: {
			message: "No such circle.",
			code: "NO_SUCH_CIRCLE",
			id: "6f6c314b-7486-4892-8965-c04a67a02923",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		userId: { type: "string", format: "misskey:id" },
		circleId: { type: "string", format: "misskey:id" },
		circleIds: {
			type: "array",
			uniqueItems: true,
			items: {
				type: "string",
				format: "misskey:id",
			},
		},
	},
	anyOf: [
		{ required: ["userId"] },
		{ required: ["circleId"] },
		{ required: ["circleIds"] },
	],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.circlesRepository)
		private circlesRepository: CirclesRepository,

		private circleEntityService: CircleEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			if (ps.circleIds) {
				const circles = await this.circlesRepository
					.createQueryBuilder("circle")
					.where({ id: In(ps.circleIds) })
					.andWhere("circle.isArchived = FALSE")
					.getMany();

				// リクエストされた通りに並べ替え
				const _circles: Circle[] = [];
				for (const id of ps.circleIds) {
					_circles.push(circles.find((x) => x.id === id)!);
				}

				return await Promise.all(
					_circles.map((x) => this.circleEntityService.pack(x, me)),
				);
			} else if (ps.userId) {
				if (me?.id !== ps.userId) {
					throw new ApiError(meta.errors.noSuchCircle);
				}

				const circles = await this.circlesRepository
					.createQueryBuilder("circle")
					.where({ userId: ps.userId })
					.andWhere("circle.isArchived = FALSE")
					.getMany();

				return await Promise.all(
					circles.map((x) => this.circleEntityService.pack(x, me)),
				);
			} else {
				const circle = await this.circlesRepository.findOneBy({
					id: ps.circleId,
				});

				if (circle == null) {
					throw new ApiError(meta.errors.noSuchCircle);
				}

				return await this.circleEntityService.pack(circle, me, true);
			}
		});
	}
}
