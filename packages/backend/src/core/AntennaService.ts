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

		if (!antenna.filterTree) {
			return true;
		}

		const notes = await this.searchService.searchNoteWithFilter(
			null,
			[JSON.parse(antenna.filterTree)],
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
