import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type {
	AntennasRepository,
	UserListsRepository,
	UsersRepository,
} from "@/models/index.js";
import type { GlobalEventService } from "@/core/GlobalEventService.js";
import type { AntennaEntityService } from "@/core/entities/AntennaEntityService.js";
import type { SearchService } from "@/core/SearchService.js";
import { DI } from "@/di-symbols.js";
import { ApiError } from "../../error.js";
import type { AntennaService } from "@/core/AntennaService.js";

export const meta = {
	tags: ["antennas"],

	requireCredential: true,

	prohibitMoved: true,

	kind: "write:account",

	errors: {
		noSuchAntenna: {
			message: "No such antenna.",
			code: "NO_SUCH_ANTENNA",
			id: "10c673ac-8852-48eb-aa1f-f5b67f069290",
		},

		noSuchUserList: {
			message: "No such user list.",
			code: "NO_SUCH_USER_LIST",
			id: "1c6b35c9-943e-48c2-81e4-2844989407f7",
		},
	},

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "Antenna",
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		antennaId: { type: "string", format: "misskey:id" },
		name: { type: "string", minLength: 1, maxLength: 100 },
		public: { type: "boolean" },
		src: { type: "string", enum: ["home", "all", "users", "list"] },
		userListId: { type: "string", format: "misskey:id", nullable: true },
		keywords: {
			type: "array",
			items: {
				type: "array",
				items: {
					type: "string",
				},
			},
		},
		excludeKeywords: {
			type: "array",
			items: {
				type: "array",
				items: {
					type: "string",
				},
			},
		},
		users: {
			type: "array",
			items: {
				type: "string",
			},
		},
		excludeUsers: {
			type: "array",
			items: {
				type: "string",
			},
		},
		caseSensitive: { type: "boolean" },
		localOnly: { type: "boolean" },
		remoteOnly: { type: "boolean" },
		withReplies: { type: "boolean" },
		withFile: { type: "boolean" },
		notify: { type: "boolean" },
		compositeAntennaIds: {
			type: "array",
			items: {
				type: "string",
				format: "misskey:id",
			},
		},
	},
	required: [
		"antennaId",
		"name",
		"src",
		"keywords",
		"excludeKeywords",
		"users",
		"caseSensitive",
		"withReplies",
		"withFile",
		"notify",
	],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.antennasRepository)
		private antennasRepository: AntennasRepository,

		@Inject(DI.antennaService)
		private antennasService: AntennaService,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.userListsRepository)
		private userListsRepository: UserListsRepository,

		@Inject(DI.searchService)
		private searchService: SearchService,

		@Inject(DI.antennaEntityService)
		private antennaEntityService: AntennaEntityService,

		@Inject(DI.globalEventService)
		private globalEventService: GlobalEventService,
	) {
		super(meta, paramDef, async (ps, me) => {
			// Fetch the antenna
			const antenna = await this.antennasRepository.findOneBy({
				id: ps.antennaId,
				userId: me.id,
			});

			if (antenna == null) {
				throw new ApiError(meta.errors.noSuchAntenna);
			}

			const filter = await this.antennasService.genarateFilter(
				antenna.id,
				ps.users,
				ps.excludeUsers,
				ps.keywords,
				ps.excludeKeywords,
				ps.src,
				ps.localOnly,
				ps.remoteOnly,
				ps.withFile,
				ps.withReplies,
				ps.compositeAntennaIds,
			);

			await this.antennasRepository.update(antenna.id, {
				public: ps.public,
				name: ps.name,
				src: ps.src,
				userListId: null,
				keywords: ps.keywords,
				excludeKeywords: ps.excludeKeywords,
				users: ps.users,
				excludeUsers: ps.excludeUsers,
				caseSensitive: ps.caseSensitive,
				localOnly: ps.localOnly,
				remoteOnly: ps.remoteOnly,
				withReplies: ps.withReplies,
				withFile: ps.withFile,
				notify: ps.notify,
				compositeAntennaIds: ps.compositeAntennaIds,
				filterTree: JSON.stringify(filter),
			});

			this.globalEventService.publishInternalEvent(
				"antennaUpdated",
				await this.antennasRepository.findOneByOrFail({ id: antenna.id }),
			);

			return await this.antennaEntityService.pack(antenna.id);
		});
	}
}
