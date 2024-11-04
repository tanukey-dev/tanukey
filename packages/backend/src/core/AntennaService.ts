import type { GlobalEventService } from "@/core/GlobalEventService.js";
import type { UsersRepository } from "@/models/Repositories.js";
import type { SearchService } from "@/core/SearchService.js";
import { bindThis } from "@/decorators.js";
import { DI } from "@/di-symbols.js";
import * as Acct from "@/misc/acct.js";
import type { Packed } from "@/misc/json-schema.js";
import type { Antenna } from "@/models/entities/Antenna.js";
import type { Note } from "@/models/entities/Note.js";
import type { User } from "@/models/entities/User.js";
import type { AntennasRepository } from "@/models/Repositories.js";
import { Inject, Injectable } from "@nestjs/common";
import { IsNull } from "typeorm";

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
	public async checkHitAntenna(
		antenna: Antenna,
		note: Note | Packed<"Note">,
	): Promise<boolean> {
		if (note.visibility === "specified") return false;
		if (note.visibility === "followers") return false;

		let userIds: string[] = [];
		if (antenna.users && antenna.users.length > 0) {
			const users = await this.usersRepository.find({
				where: [
					...antenna.users.map((username) => {
						const acct = Acct.parse(username);
						return { username: acct.username, host: acct.host ?? IsNull() };
					}),
				],
			});
			userIds = users.map((u) => u.id);
		}

		const notes = await this.searchService.searchNote(
			"",
			null,
			{
				userIds: userIds,
				origin: antenna.localOnly ? "local" : undefined,
				keywords: antenna.keywords,
				excludeKeywords: antenna.excludeKeywords,
				checkChannelSearchable: true,
				reverseOrder: false,
				hasFile: antenna.withFile,
				includeReplies: antenna.withReplies,
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
