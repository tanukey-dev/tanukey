import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type { IdService } from "@/core/IdService.js";
import type {
	UserListsRepository,
	AntennasRepository,
	UsersRepository,
} from "@/models/index.js";
import type { GlobalEventService } from "@/core/GlobalEventService.js";
import type { AntennaEntityService } from "@/core/entities/AntennaEntityService.js";
import type { SearchService } from "@/core/SearchService.js";
import { DI } from "@/di-symbols.js";
import type { RoleService } from "@/core/RoleService.js";
import { ApiError } from "../../error.js";
import type { AntennaService } from "@/core/AntennaService.js";

export const meta = {
	tags: ["antennas"],

	requireCredential: true,

	prohibitMoved: true,

	kind: "write:account",

	errors: {
		noSuchUserList: {
			message: "No such user list.",
			code: "NO_SUCH_USER_LIST",
			id: "95063e93-a283-4b8b-9aa5-bcdb8df69a7f",
		},

		tooManyAntennas: {
			message: "You cannot create antenna any more.",
			code: "TOO_MANY_ANTENNAS",
			id: "faf47050-e8b5-438c-913c-db2b1576fde4",
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
		name: { type: "string", minLength: 1, maxLength: 100 },
		public: { type: "boolean" },
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
		imageTypes: {
			type: "array",
			items: {
				type: "string",
			},
		},
		imageLabels: {
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
		"name",
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

		@Inject(DI.roleService)
		private roleService: RoleService,

		@Inject(DI.idService)
		private idService: IdService,

		@Inject(DI.globalEventService)
		private globalEventService: GlobalEventService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const currentAntennasCount = await this.antennasRepository.countBy({
				userId: me.id,
			});
			if (
				currentAntennasCount >
				(await this.roleService.getUserPolicies(me.id)).antennaLimit
			) {
				throw new ApiError(meta.errors.tooManyAntennas);
			}

			const id = this.idService.genId();
			const now = new Date();

			const filter = await this.antennasService.genarateFilter(
				id,
				ps.name,
				ps.users,
				ps.excludeUsers,
				ps.keywords,
				ps.excludeKeywords,
				ps.localOnly ? "local" : ps.remoteOnly ? "remote" : "combined",
				true,
				false,
				ps.withFile,
				ps.withReplies,
				ps.imageTypes,
				ps.imageLabels,
				ps.compositeAntennaIds,
			);

			const antenna = await this.antennasRepository
				.insert({
					id: id,
					createdAt: now,
					lastUsedAt: now,
					public: ps.public,
					userId: me.id,
					name: ps.name,
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
					imageTypes: ps.imageTypes,
					imageLabels: ps.imageLabels,
					compositeAntennaIds: ps.compositeAntennaIds,
					filterTree: JSON.stringify(filter),
				})
				.then((x) => this.antennasRepository.findOneByOrFail(x.identifiers[0]));

			this.globalEventService.publishInternalEvent("antennaCreated", antenna);

			return await this.antennaEntityService.pack(antenna);
		});
	}
}
