import type { Config } from "@/config.js";
import type { RoleService } from "@/core/RoleService.js";
import type { SearchService } from "@/core/SearchService.js";
import type { NoteEntityService } from "@/core/entities/NoteEntityService.js";
import { DI } from "@/di-symbols.js";
import type { User, UsersRepository } from "@/models/index.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { Inject, Injectable } from "@nestjs/common";
import { ApiError } from "../../error.js";

export const meta = {
	tags: ["notes"],

	requireCredential: false,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "Note",
		},
	},

	errors: {
		unavailable: {
			message: "Search of notes unavailable.",
			code: "UNAVAILABLE",
			id: "0b44998d-77aa-4427-80d0-d2c9b8523011",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		query: { type: "string" },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		origin: {
			type: "string",
			enum: ["local", "remote", "combined"],
			default: "combined",
		},
		offset: { type: "integer", default: 0 },
		users: {
			type: "array",
			items: {
				type: "string",
			},
		},
		channelId: {
			type: "string",
			format: "misskey:id",
			nullable: true,
			default: null,
		},
		checkChannelSearchable: { type: "boolean", nullable: true, default: true },
		createAtBegin: { type: "integer", nullable: true, default: null },
		createAtEnd: { type: "integer", nullable: true, default: null },
		reverseOrder: { type: "boolean", nullable: true, default: false },
		hasFile: { type: "boolean", nullable: true, default: false },
	},
	required: ["query"],
} as const;

// TODO: ロジックをサービスに切り出す

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.config)
		private config: Config,

		private usersRepository: UsersRepository,
		private noteEntityService: NoteEntityService,
		private searchService: SearchService,
		private roleService: RoleService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const policies = await this.roleService.getUserPolicies(
				me ? me.id : null,
			);
			if (!policies.canSearchNotes) {
				throw new ApiError(meta.errors.unavailable);
			}

			let userIds: string[] = [];
			if (ps.users) {
				const users = await usersRepository.find({
					where: [
						...ps.users.map((username) => {
							return { username: username };
						}),
					],
				});
				userIds = users.map((u) => u.id);
			}

			const notes = await this.searchService.searchNote(
				ps.query,
				me,
				{
					userIds: userIds,
					channelId: ps.channelId,
					origin: ps.origin,
					checkChannelSearchable: ps.checkChannelSearchable ?? true,
					createAtBegin: ps.createAtBegin ?? undefined,
					createAtEnd: ps.createAtEnd ?? undefined,
					reverseOrder: ps.reverseOrder ?? false,
					hasFile: ps.hasFile ?? false,
				},
				{
					untilId: ps.untilId,
					sinceId: ps.sinceId,
					limit: ps.limit,
				},
			);

			return await this.noteEntityService.packMany(notes, me);
		});
	}
}
