import { Inject, Injectable } from "@nestjs/common";
import type { DriveFilesRepository } from "@/models/Repositories.js";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { DriveFileEntityService } from "@/core/entities/DriveFileEntityService.js";
import { DI } from "@/di-symbols.js";

export const meta = {
	tags: ["drive"],

	requireCredential: true,

	kind: "read:drive",

	description: "Search for a drive file by a hash of the contents.",

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "DriveFile",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		md5: { type: "string" },
	},
	required: ["md5"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private driveFileEntityService: DriveFileEntityService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const files = await this.driveFilesRepository.findBy({
				md5: ps.md5,
				userId: me.id,
			});

			return await this.driveFileEntityService.packMany(files, { self: true });
		});
	}
}
