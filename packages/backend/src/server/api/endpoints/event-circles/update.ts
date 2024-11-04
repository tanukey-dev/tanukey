import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type {
	DriveFilesRepository,
	EventCirclesRepository,
	CirclesRepository,
	EventsRepository,
} from "@/models/Repositories.js";
import { EventCircleEntityService } from "@/core/entities/EventCircleEntityService.js";
import { DI } from "@/di-symbols.js";
import { RoleService } from "@/core/RoleService.js";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["eventCircles"],

	requireCredential: true,
	kind: "read:account",

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "EventCircle",
	},

	errors: {
		noSuchEventCircle: {
			message: "No such eventCircle.",
			code: "NO_SUCH_EVENT_CIRCLE",
			id: "6f6c314b-7486-4897-8963-c04a66a02923",
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

		noSuchEvent: {
			message: "No such event.",
			code: "NO_SUCH_EVENT",
			id: "6f6c314b-7486-4893-8966-c04a66a02923",
		},

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
		eventCircleId: { type: "string", format: "misskey:id" },
		circleId: { type: "string", format: "misskey:id" },
		description: {
			type: "string",
			nullable: true,
			minLength: 1,
			maxLength: 8192,
		},
		pageId: { type: "string", format: "misskey:id", nullable: true },
		isArchived: { type: "boolean", nullable: true },
	},
	required: ["eventCircleId"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.eventCirclesRepository)
		private eventCirclesRepository: EventCirclesRepository,

		@Inject(DI.circlesRepository)
		private circlesRepository: CirclesRepository,

		@Inject(DI.eventsRepository)
		private eventsRepository: EventsRepository,

		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private eventCircleEntityService: EventCircleEntityService,

		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const eventCircle = await this.eventCirclesRepository.findOneBy({
				id: ps.eventCircleId,
			});

			if (eventCircle == null) {
				throw new ApiError(meta.errors.noSuchEventCircle);
			}

			const event = await this.eventsRepository.findOneBy({
				id: eventCircle.eventId,
			});

			if (event == null) {
				throw new ApiError(meta.errors.noSuchEvent);
			}

			const circle = await this.circlesRepository.findOneBy({
				id: eventCircle.circleId,
			});

			if (circle == null) {
				throw new ApiError(meta.errors.noSuchCircle);
			}

			//イベントのオーナー,サークルのオーナー,管理者が変更可能
			const iAmModerator = await this.roleService.isModerator(me);
			if (event.userId !== me.id && circle.userId !== me.id && !iAmModerator) {
				throw new ApiError(meta.errors.accessDenied);
			}

			await this.eventCirclesRepository.update(eventCircle.id, {
				...(ps.description !== undefined
					? { description: ps.description }
					: {}),
				...(ps.circleId !== undefined ? { circleId: ps.circleId } : {}),
				...(ps.pageId !== undefined ? { pageId: ps.pageId } : {}),
				...(typeof ps.isArchived === "boolean"
					? { isArchived: ps.isArchived }
					: {}),
			});

			return await this.eventCircleEntityService.pack(eventCircle.id, me);
		});
	}
}
