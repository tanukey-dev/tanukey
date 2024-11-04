import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type {
	DriveFilesRepository,
	EventsRepository,
} from "@/models/Repositories.js";
import { EventEntityService } from "@/core/entities/EventEntityService.js";
import { DI } from "@/di-symbols.js";
import { RoleService } from "@/core/RoleService.js";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["events"],

	requireCredential: true,
	kind: "read:account",

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "Event",
	},

	errors: {
		noSuchEvent: {
			message: "No such event.",
			code: "NO_SUCH_CHANNEL",
			id: "6f6c314b-7486-4893-8966-c04a66a02923",
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
		eventId: { type: "string", format: "misskey:id" },
		name: { type: "string", minLength: 1, maxLength: 128 },
		description: {
			type: "string",
			nullable: true,
			minLength: 1,
			maxLength: 8192,
		},
		bannerId: { type: "string", format: "misskey:id", nullable: true },
		expiresAt: { type: "integer" },
		startsAt: { type: "integer" },
		pageId: { type: "string", format: "misskey:id", nullable: true },
		isArchived: { type: "boolean", nullable: true },
	},
	required: ["eventId"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.eventsRepository)
		private eventsRepository: EventsRepository,

		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private eventEntityService: EventEntityService,

		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const event = await this.eventsRepository.findOneBy({
				id: ps.eventId,
			});

			if (event == null) {
				throw new ApiError(meta.errors.noSuchEvent);
			}

			const iAmModerator = await this.roleService.isModerator(me);
			if (event.userId !== me.id && !iAmModerator) {
				throw new ApiError(meta.errors.accessDenied);
			}

			// eslint:disable-next-line:no-unnecessary-initializer
			let banner = undefined;
			if (ps.bannerId != null) {
				banner = await this.driveFilesRepository.findOneBy({
					id: ps.bannerId,
					userId: me.id,
				});

				if (banner == null) {
					throw new ApiError(meta.errors.noSuchFile);
				}
			} else if (ps.bannerId === null) {
				banner = null;
			}

			await this.eventsRepository.update(event.id, {
				...(ps.name !== undefined ? { name: ps.name } : {}),
				...(ps.description !== undefined
					? { description: ps.description }
					: {}),
				...(banner ? { bannerId: banner.id } : {}),
				...(ps.expiresAt !== undefined
					? { expiresAt: new Date(ps.expiresAt) }
					: {}),
				...(ps.startsAt !== undefined
					? { startsAt: new Date(ps.startsAt) }
					: {}),
				...(ps.pageId !== undefined ? { pageId: ps.pageId } : {}),
				...(typeof ps.isArchived === "boolean"
					? { isArchived: ps.isArchived }
					: {}),
			});

			return await this.eventEntityService.pack(event.id, me);
		});
	}
}
