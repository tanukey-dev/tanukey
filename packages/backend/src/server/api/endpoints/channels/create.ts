import { IdService } from "@/core/IdService.js";
import { ChannelEntityService } from "@/core/entities/ChannelEntityService.js";
import { DI } from "@/di-symbols.js";
import type { Channel } from "@/models/entities/Channel.js";
import type {
	ChannelsRepository,
	DriveFilesRepository,
} from "@/models/index.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { Inject, Injectable } from "@nestjs/common";
import ms from "ms";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["channels"],

	requireCredential: true,

	prohibitMoved: true,

	kind: "write:channels",

	limit: {
		duration: ms("1hour"),
		max: 10,
	},

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "Channel",
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
			maxLength: 2048,
		},
		bannerId: { type: "string", format: "misskey:id", nullable: true },
		color: { type: "string", minLength: 1, maxLength: 16 },
		federation: { type: "boolean", nullable: true },
		searchable: { type: "boolean", nullable: true },
		isNoteCollapsed: { type: "boolean", nullable: true },
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
		tags: {
			type: "array",
			items: {
				type: "string",
			},
		},
		antennaId: { type: "string", format: "misskey:id", nullable: true },
	},
	required: ["name"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		@Inject(DI.channelsRepository)
		private channelsRepository: ChannelsRepository,

		private idService: IdService,
		private channelEntityService: ChannelEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			let banner = null;
			if (ps.bannerId != null) {
				banner = await this.driveFilesRepository.findOneBy({
					id: ps.bannerId,
					userId: me.id,
				});

				if (banner == null) {
					throw new ApiError(meta.errors.noSuchFile);
				}
			}

			const channel = await this.channelsRepository
				.insert({
					id: this.idService.genId(),
					createdAt: new Date(),
					userId: me.id,
					name: ps.name,
					description: ps.description ?? null,
					bannerId: banner ? banner.id : null,
					federation: ps.federation ?? false,
					searchable: ps.searchable ?? true,
					isNoteCollapsed: ps.isNoteCollapsed ?? true,
					isPrivate: ps.isPrivate ?? false,
					privateUserIds: ps.privateUserIds ?? [],
					moderatorUserIds: ps.moderatorUserIds ?? [],
					tags: ps.tags,
					...(ps.color !== undefined ? { color: ps.color } : {}),
					antennaId: ps.antennaId ?? null,
				} as Channel)
				.then((x) => this.channelsRepository.findOneByOrFail(x.identifiers[0]));

			return await this.channelEntityService.pack(channel, me);
		});
	}
}
