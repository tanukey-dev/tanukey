import type { GlobalEventService } from "@/core/GlobalEventService.js";
import type { UsersRepository } from "@/models/index.js";
import type { SearchService } from "@/core/SearchService.js";
import { bindThis } from "@/decorators.js";
import { DI } from "@/di-symbols.js";
import * as Acct from "@/misc/acct.js";
import type { Packed } from "@/misc/json-schema.js";
import type { Antenna } from "@/models/entities/Antenna.js";
import type { Note } from "@/models/entities/Note.js";
import type { User } from "@/models/entities/User.js";
import type { AntennasRepository } from "@/models/index.js";
import { Inject, Injectable } from "@nestjs/common";
import { IsNull } from "typeorm";
import { fi, id } from "date-fns/locale";
import { get } from "nested-property";

@Injectable()
export class AntennaService {
	private antennasFetched: boolean;
	private antennas: Antenna[];

	constructor(
		@Inject(DI.antennasRepository)
		private antennasRepository: AntennasRepository,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.searchService)
		private searchService: SearchService,

		@Inject(DI.globalEventService)
		private globalEventService: GlobalEventService,
	) {
		this.antennasFetched = false;
		this.antennas = [];
	}

	@bindThis
	public async addNoteToAntennas(
		note: Note,
		noteUser: { id: User["id"]; username: string; host: string | null },
	): Promise<void> {
		const antennas = await this.getAntennas();
		const antennasWithMatchResult = await Promise.all(
			antennas.map((antenna) =>
				this.checkHitAntenna(antenna, note).then(
					(hit) => [antenna, hit] as const,
				),
			),
		);
		const matchedAntennas = antennasWithMatchResult
			.filter(([, hit]) => hit)
			.map(([antenna]) => antenna);

		for (const antenna of matchedAntennas) {
			this.globalEventService.publishAntennaStream(antenna.id, "note", note);
		}
	}

	@bindThis
	public async genarateFilter(
		antennaId: string,
		antennaName: string,
		users?: string[] | null,
		excludeUsers?: string[] | null,
		keywords?: string[][],
		excludeKeywords?: string[][],
		origin?: string,
		checkChannelSearchable?: boolean,
		reverseOrder?: boolean,
		hasFile?: boolean,
		includeReplies?: boolean,
		imageTypes?: string[],
		imageLabels?: string[],
		compositeAntennaIds?: string[],
		idSet?: Set<string>,
	) {
		let userIds: string[] = [];
		if (users && users.length > 0) {
			userIds = (
				(await this.usersRepository.find({
					where: [
						...users.map((username) => {
							const acct = Acct.parse(username);
							return { username: acct.username, host: acct.host ?? IsNull() };
						}),
					],
				})) ?? []
			).map((u) => u.id);
		}

		let excludeUserIds: string[] = [];
		if (excludeUsers && excludeUsers.length > 0) {
			excludeUserIds = (
				(await this.usersRepository.find({
					where: [
						...excludeUsers.map((username) => {
							const acct = Acct.parse(username);
							return { username: acct.username, host: acct.host ?? IsNull() };
						}),
					],
				})) ?? []
			).map((u) => u.id);
		}

		const filter = await this.searchService.getFilter("", {
			userIds: userIds,
			excludeUserIds: excludeUserIds,
			origin: origin,
			keywords: keywords,
			excludeKeywords: excludeKeywords,
			checkChannelSearchable: checkChannelSearchable,
			reverseOrder: reverseOrder,
			hasFile: hasFile,
			includeReplies: includeReplies,
			imageTypes: imageTypes,
			imageLabels: imageLabels,
			tags: [],
		});

		const baseIdSet = idSet ?? new Set<string>();
		baseIdSet.add(antennaId);

		if (compositeAntennaIds && compositeAntennaIds.length > 0) {
			const tmpFilter = {
				bool: {
					// _name: "composite antennas",
					should: [] as any[],
					minimum_should_match: 1,
				},
			};

			let update = false;
			for (const compositeAntennaId of compositeAntennaIds) {
				if (baseIdSet.has(compositeAntennaId)) {
					// 循環参照
					continue;
				}

				const antenna = await this.antennasRepository.findOneBy({
					id: compositeAntennaId,
				});

				if (!antenna) {
					// 存在しないアンテナ
					continue;
				}

				const childFilter = await this.genarateFilter(
					compositeAntennaId,
					antenna.name,
					antenna.users,
					antenna.excludeUsers,
					antenna.keywords,
					antenna.excludeKeywords,
					antenna.localOnly
						? "local"
						: antenna.remoteOnly
							? "remote"
							: "combined",
					true,
					false,
					antenna.withFile,
					antenna.withReplies,
					antenna.imageTypes,
					antenna.imageLabels,
					antenna.compositeAntennaIds,
					baseIdSet,
				);

				tmpFilter.bool.should.push(childFilter);
				update = true;
			}

			if (update) {
				filter.bool.must.push(tmpFilter);
			}
		}

		return filter;
	}

	@bindThis
	public async getOrGenerateFilter(antenna: Antenna) {
		if (!antenna.filterTree) {
			// フィルター未生成
			antenna.filterTree = JSON.stringify(
				await this.genarateFilter(
					antenna.id,
					antenna.name,
					antenna.users,
					antenna.excludeUsers,
					antenna.keywords,
					antenna.excludeKeywords,
					antenna.localOnly
						? "local"
						: antenna.remoteOnly
							? "remote"
							: "combined",
					true,
					false,
					antenna.withFile,
					antenna.withReplies,
					antenna.imageTypes,
					antenna.imageLabels,
					antenna.compositeAntennaIds,
				),
			);

			await this.antennasRepository.update(antenna.id, {
				filterTree: antenna.filterTree,
			});
		}

		let filter = JSON.parse(antenna.filterTree);
		if (
			filter === undefined ||
			filter.bool === undefined ||
			filter.bool.must === undefined
		) {
			// データ不整合っぽいので再度フィルタを生成
			filter = await this.genarateFilter(
				antenna.id,
				antenna.name,
				antenna.users,
				antenna.excludeUsers,
				antenna.keywords,
				antenna.excludeKeywords,
				antenna.localOnly
					? "local"
					: antenna.remoteOnly
						? "remote"
						: "combined",
				true,
				false,
				antenna.withFile,
				antenna.withReplies,
				antenna.imageTypes,
				antenna.imageLabels,
				antenna.compositeAntennaIds,
			);

			await this.antennasRepository.update(antenna.id, {
				filterTree: JSON.stringify(filter),
			});
		}

		return filter;
	}

	@bindThis
	public async checkHitAntenna(
		antenna: Antenna,
		note: Note | Packed<"Note">,
	): Promise<boolean> {
		if (note.visibility === "specified") return false;
		if (note.visibility === "followers") return false;

		const notes = await this.searchService.searchNoteWithFilter(
			null,
			[await this.getOrGenerateFilter(antenna)],
			{
				checkChannelSearchable: true,
				reverseOrder: false,
			},
			{
				equal: note.id,
				limit: 1,
			},
		);

		return notes.length > 0;
	}

	@bindThis
	public async getAntennas() {
		if (!this.antennasFetched) {
			this.antennas = await this.antennasRepository.findBy({
				isActive: true,
			});
			this.antennasFetched = true;
		}

		return this.antennas;
	}
}
