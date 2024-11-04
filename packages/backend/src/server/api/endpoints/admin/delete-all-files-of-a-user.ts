import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type { DriveFilesRepository } from "@/models/Repositories.js";
import { DriveService } from "@/core/DriveService.js";
import { DI } from "@/di-symbols.js";

export const meta = {
	tags: ["admin"],

	requireCredential: true,
	requireAdmin: true,
	kind: "write:admin:delete-all-files-of-a-user",
} as const;

export const paramDef = {
	type: "object",
	properties: {
		userId: { type: "string", format: "misskey:id" },
	},
	required: ["userId"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private driveService: DriveService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const files = await this.driveFilesRepository.findBy({
				userId: ps.userId,
			});

			for (const file of files) {
				this.driveService.deleteFile(file);
			}
		});
	}
}
