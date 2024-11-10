import { RoleService } from "@/core/RoleService.js";
import { ChannelEntityService } from "@/core/entities/ChannelEntityService.js";
import { DI } from "@/di-symbols.js";
import type {
	ChannelsRepository,
	DriveFilesRepository,
} from "@/models/index.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { Inject, Injectable } from "@nestjs/common";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["channels"],

	requireCredential: true,

	kind: "write:channels",

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "Channel",
	},

	errors: {
		noSuchChannel: {
			message: "No such channel.",
			code: "NO_SUCH_CHANNEL",
			id: "f9c5467f-d492-4c3c-9a8d-a70dacc86512",
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
		channelId: { type: "string", format: "misskey:id" },
		name: { type: "string", minLength: 1, maxLength: 128 },
		description: {
			type: "string",
			nullable: true,
			minLength: 1,
			maxLength: 2048,
		},
		bannerId: { type: "string", format: "misskey:id", nullable: true },
		isArchived: { type: "boolean", nullable: true },
		federation: { type: "boolean", nullable: true },
		searchable: { type: "boolean", nullable: true },
		isNoteCollapsed: { type: "boolean", nullable: true },
		pinnedNoteIds: {
			type: "array",
			items: {
				type: "string",
				format: "misskey:id",
			},
		},
		isPrivate: { type: "boolean", nullable: true },
		privateUserIds: {
			type: "array",
			items: {
				type: "string",
				format: "misskey:id",
			},
		},
		moderatorUserIds: {
			type: "array",
			items: {
				type: "string",
				format: "misskey:id",
			},
		},
		color: { type: "string", minLength: 1, maxLength: 16 },
		tags: {
			type: "array",
			items: {
				type: "string",
			},
		},
		notificationTags: {
			type: "array",
			items: {
				type: "string",
			},
		},
	},
	required: ["channelId"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.channelsRepository)
		private channelsRepository: ChannelsRepository,

		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private channelEntityService: ChannelEntityService,

		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const channel = await this.channelsRepository.findOneBy({
				id: ps.channelId,
			});

			if (channel == null) {
				throw new ApiError(meta.errors.noSuchChannel);
			}

			const iAmModerator = await this.roleService.isModerator(me);
			if (
				channel.userId !== me.id &&
				!channel.moderatorUserIds.includes(me.id) &&
				!iAmModerator
			) {
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

			await this.channelsRepository.update(channel.id, {
				...(ps.name !== undefined ? { name: ps.name } : {}),
				...(ps.description !== undefined
					? { description: ps.description }
					: {}),
				...(ps.pinnedNoteIds !== undefined
					? { pinnedNoteIds: ps.pinnedNoteIds }
					: {}),
				...(ps.color !== undefined ? { color: ps.color } : {}),
				...(typeof ps.isArchived === "boolean"
					? { isArchived: ps.isArchived }
					: {}),
				...(typeof ps.federation === "boolean"
					? { federation: ps.federation }
					: {}),
				...(typeof ps.searchable === "boolean"
					? { searchable: ps.searchable }
					: {}),
				...(typeof ps.isNoteCollapsed === "boolean"
					? { isNoteCollapsed: ps.isNoteCollapsed }
					: {}),
				...(typeof ps.isPrivate === "boolean"
					? { isPrivate: ps.isPrivate }
					: {}),
				...(ps.privateUserIds !== undefined
					? { privateUserIds: ps.privateUserIds }
					: {}),
				...(ps.moderatorUserIds !== undefined
					? { moderatorUserIds: ps.moderatorUserIds }
					: {}),
				...(banner ? { bannerId: banner.id } : {}),
				...(ps.tags !== undefined ? { tags: ps.tags } : {}),
				...(ps.notificationTags !== undefined
					? { notificationTags: ps.notificationTags }
					: {}),
				...(ps.antennaId !== undefined ? { antennaId: ps.antennaId } : {}),
			});

			return await this.channelEntityService.pack(channel.id, me);
		});
	}
}
