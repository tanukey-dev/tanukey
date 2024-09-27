import type { SearchService } from "@/core/SearchService.js";
import type { NoteEntityService } from "@/core/entities/NoteEntityService.js";
import { DI } from "@/di-symbols.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { Inject, Injectable } from "@nestjs/common";

export const meta = {
	tags: ["users", "notes"],

	description: "Show all notes that this user created.",

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
		noSuchUser: {
			message: "No such user.",
			code: "NO_SUCH_USER",
			id: "27e494ba-2ac2-48e8-893b-10d4d8c2387b",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		userId: { type: "string", format: "misskey:id" },
		includeReplies: { type: "boolean", default: true },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
		sinceDate: { type: "integer" },
		untilDate: { type: "integer" },
		includeMyRenotes: { type: "boolean", default: true },
		withFiles: { type: "boolean", default: false },
		fileType: {
			type: "array",
			items: {
				type: "string",
			},
		},
		excludeNsfw: { type: "boolean", default: false },
	},
	required: ["userId"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.noteEntityService)
		private noteEntityService: NoteEntityService,

		@Inject(DI.searchService)
		private searchService: SearchService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const notes = await this.searchService.searchNote(
				"",
				me,
				{
					userIds: [ps.userId],
					checkChannelSearchable: true,
					includeReplies: ps.includeReplies,
					reverseOrder: false,
					hasFile: ps.withFiles,
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
