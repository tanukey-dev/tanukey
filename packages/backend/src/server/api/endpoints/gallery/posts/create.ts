import ms from "ms";
import { Inject, Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import type {
	DriveFilesRepository,
	GalleryPostsRepository,
} from "@/models/Repositories.js";
import {
	GalleryPost,
	ViewMode,
	ViewSettings,
} from "@/models/entities/GalleryPost.js";
import type { DriveFile } from "@/models/entities/DriveFile.js";
import { IdService } from "@/core/IdService.js";
import { GalleryPostEntityService } from "@/core/entities/GalleryPostEntityService.js";
import { DI } from "@/di-symbols.js";

export const meta = {
	tags: ["gallery"],

	requireCredential: true,

	prohibitMoved: true,

	kind: "write:gallery",

	limit: {
		duration: ms("1hour"),
		max: 20,
	},

	res: {
		type: "object",
		optional: false,
		nullable: false,
		ref: "GalleryPost",
	},

	errors: {},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		title: { type: "string", minLength: 1 },
		description: { type: "string", nullable: true },
		viewSettings: {
			type: "object",
			nullable: true,
			properties: {
				initialMode: {
					type: "string",
					enum: ["DEFAULT", "BOOK"],
					default: "DEFAULT",
				},
				rightOpening: { type: "boolean", default: true },
				double: { type: "boolean", default: true },
			},
		},
		fileIds: {
			type: "array",
			uniqueItems: true,
			minItems: 1,
			maxItems: 32,
			items: {
				type: "string",
				format: "misskey:id",
			},
		},
		isSensitive: { type: "boolean", default: false },
	},
	required: ["title", "fileIds"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.galleryPostsRepository)
		private galleryPostsRepository: GalleryPostsRepository,

		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private galleryPostEntityService: GalleryPostEntityService,
		private idService: IdService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const files = (
				await Promise.all(
					ps.fileIds.map((fileId) =>
						this.driveFilesRepository.findOneBy({
							id: fileId,
							userId: me.id,
						}),
					),
				)
			).filter((file): file is DriveFile => file != null);

			if (files.length === 0) {
				throw new Error();
			}

			const viewSettings: ViewSettings = ps.viewSettings
				? {
						initialMode:
							ViewMode[ps.viewSettings.initialMode as keyof typeof ViewMode],
						rightOpening: ps.viewSettings.rightOpening,
						double: ps.viewSettings.double,
					}
				: {
						initialMode: ViewMode.DEFAULT,
						rightOpening: true,
						double: true,
					};

			const post = await this.galleryPostsRepository
				.insert(
					new GalleryPost({
						id: this.idService.genId(),
						createdAt: new Date(),
						updatedAt: new Date(),
						title: ps.title,
						description: ps.description,
						userId: me.id,
						isSensitive: ps.isSensitive,
						fileIds: files.map((file) => file.id),
						viewSettings: viewSettings,
					}),
				)
				.then((x) =>
					this.galleryPostsRepository.findOneByOrFail(x.identifiers[0]),
				);

			return await this.galleryPostEntityService.pack(post, me);
		});
	}
}
