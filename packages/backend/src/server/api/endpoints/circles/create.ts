import { Inject, Injectable } from "@nestjs/common";
import ms from "ms";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type {
	Circle,
	CirclesRepository,
	DriveFilesRepository,
} from "@/models/Repositories.js";
import type { Channel } from "@/models/entities/Channel.js";
import { IdService } from "@/core/IdService.js";
import { CircleEntityService } from "@/core/entities/CircleEntityService.js";
import { DI } from "@/di-symbols.js";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["circles"],

	requireCredential: true,
	kind: "read:account",

	limit: {
		duration: ms("1hour"),
		max: 10,
	},

	errors: {
		noSuchFile: {
			message: "No such file.",
			code: "NO_SUCH_FILE",
			id: "cd1e9f3e-5a12-4ab4-96f6-5d0a2cc32050",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		name: { type: "string", minLength: 1, maxLength: 128 },
		description: {
			type: "string",
			nullable: true,
			minLength: 1,
			maxLength: 8192,
		},
		profileImageId: { type: "string", format: "misskey:id", nullable: true },
		pageId: { type: "string", format: "misskey:id", nullable: true },
	},
	required: ["name"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		@Inject(DI.circlesRepository)
		private circlesRepository: CirclesRepository,

		private idService: IdService,
		private circleEntityService: CircleEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			let profileImage = null;
			if (ps.profileImageId != null) {
				profileImage = await this.driveFilesRepository.findOneBy({
					id: ps.profileImageId,
					userId: me.id,
				});

				if (profileImage == null) {
					throw new ApiError(meta.errors.noSuchFile);
				}
			}

			const channel = await this.circlesRepository
				.insert({
					id: this.idService.genId(),
					createdAt: new Date(),
					userId: me.id,
					name: ps.name,
					description: ps.description ?? null,
					profileImageId: profileImage ? profileImage.id : null,
					pageId: ps.pageId ?? null,
				} as Circle)
				.then((x) => this.circlesRepository.findOneByOrFail(x.identifiers[0]));

			return await this.circleEntityService.pack(channel, me);
		});
	}
}
