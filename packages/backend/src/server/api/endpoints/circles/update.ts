import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type {
	DriveFilesRepository,
	CirclesRepository,
} from "@/models/Repositories.js";
import { CircleEntityService } from "@/core/entities/CircleEntityService.js";
import { DI } from "@/di-symbols.js";
import { RoleService } from "@/core/RoleService.js";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["circles"],

	requireCredential: true,
	kind: "read:account",

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "Circle",
	},

	errors: {
		noSuchCircle: {
			message: "No such circle.",
			code: "NO_SUCH_CIRCLE",
			id: "f9c5467f-d492-4c4c-9a8d-a71dacc86512",
		},

		accessDenied: {
			message: "You do not have edit privilege of the channel.",
			code: "ACCESS_DENIED",
			id: "1fb7cb09-d46a-4fdf-b8df-057788cce513",
		},

		noSuchFile: {
			message: "No such file.",
			code: "NO_SUCH_FILE",
			id: "e86c14a4-0da2-4032-8df3-e737a04c7f3b",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		circleId: { type: "string", format: "misskey:id" },
		name: { type: "string", minLength: 1, maxLength: 128 },
		description: {
			type: "string",
			nullable: true,
			minLength: 1,
			maxLength: 8192,
		},
		profileImageId: { type: "string", format: "misskey:id", nullable: true },
		pageId: { type: "string", format: "misskey:id", nullable: true },
		isArchived: { type: "boolean", nullable: true },
	},
	required: ["circleId"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.circlesRepository)
		private circlesRepository: CirclesRepository,

		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private circleEntityService: CircleEntityService,

		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const circle = await this.circlesRepository.findOneBy({
				id: ps.circleId,
			});

			if (circle == null) {
				throw new ApiError(meta.errors.noSuchCircle);
			}

			const iAmModerator = await this.roleService.isModerator(me);
			if (circle.userId !== me.id && !iAmModerator) {
				throw new ApiError(meta.errors.accessDenied);
			}

			// eslint:disable-next-line:no-unnecessary-initializer
			let profileImage = undefined;
			if (ps.profileImageId != null) {
				profileImage = await this.driveFilesRepository.findOneBy({
					id: ps.profileImageId,
					userId: me.id,
				});

				if (profileImage == null) {
					throw new ApiError(meta.errors.noSuchFile);
				}
			} else if (ps.profileImageId === null) {
				profileImage = null;
			}

			await this.circlesRepository.update(circle.id, {
				...(ps.name !== undefined ? { name: ps.name } : {}),
				...(ps.description !== undefined
					? { description: ps.description }
					: {}),
				...(profileImage ? { profileImageId: profileImage.id } : {}),
				...(ps.pageId !== undefined ? { pageId: ps.pageId } : {}),
				...(typeof ps.isArchived === "boolean"
					? { isArchived: ps.isArchived }
					: {}),
			});

			return await this.circleEntityService.pack(circle.id, me);
		});
	}
}
