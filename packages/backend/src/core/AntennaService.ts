import { GlobalEventService } from "@/core/GlobalEventService.js";
import { IdService } from "@/core/IdService.js";
import { PushNotificationService } from "@/core/PushNotificationService.js";
import { UtilityService } from "@/core/UtilityService.js";
import { AntennaEntityService } from "@/core/entities/AntennaEntityService.js";
import { NoteEntityService } from "@/core/entities/NoteEntityService.js";
import type { UsersRepository } from "@/models/index.js";
import type { SearchService } from "@/core/SearchService.js";
import { bindThis } from "@/decorators.js";
import { DI } from "@/di-symbols.js";
import * as Acct from "@/misc/acct.js";
import { isUserRelated } from "@/misc/is-user-related.js";
import type { Packed } from "@/misc/json-schema.js";
import type { Antenna } from "@/models/entities/Antenna.js";
import type { Note } from "@/models/entities/Note.js";
import type { User } from "@/models/entities/User.js";
import type {
	AntennasRepository,
	ChannelsRepository,
	MutingsRepository,
	NotesRepository,
	UserListJoiningsRepository,
} from "@/models/index.js";
import { StreamMessages } from "@/server/api/stream/types.js";
import { Inject, Injectable } from "@nestjs/common";
import type { OnApplicationShutdown } from "@nestjs/common";
import * as Redis from "ioredis";
import { IsNull } from "typeorm";

@Injectable()
export class AntennaService implements OnApplicationShutdown {
	private antennasFetched: boolean;
	private antennas: Antenna[];

	constructor(
		@Inject(DI.redis)
		private redisClient: Redis.Redis,

		@Inject(DI.redisForSub)
		private redisForSub: Redis.Redis,

		@Inject(DI.mutingsRepository)
		private mutingsRepository: MutingsRepository,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		@Inject(DI.antennasRepository)
		private antennasRepository: AntennasRepository,

		@Inject(DI.channelsRepository)
		private channelsRepository: ChannelsRepository,

		@Inject(DI.userListJoiningsRepository)
		private userListJoiningsRepository: UserListJoiningsRepository,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.searchService)
		private searchService: SearchService,

		private utilityService: UtilityService,
		private idService: IdService,
		private globalEventService: GlobalEventService,
		private pushNotificationService: PushNotificationService,
		private noteEntityService: NoteEntityService,
		private antennaEntityService: AntennaEntityService,
	) {
		this.antennasFetched = false;
		this.antennas = [];

		this.redisForSub.on("message", this.onRedisMessage);
	}

	@bindThis
	private async onRedisMessage(_: string, data: string): Promise<void> {
		const obj = JSON.parse(data);

		if (obj.channel === "internal") {
			const { type, body } =
				obj.message as StreamMessages["internal"]["payload"];
			switch (type) {
				case "antennaCreated":
					this.antennas.push({
						...body,
						createdAt: new Date(body.createdAt),
						lastUsedAt: new Date(body.lastUsedAt),
					});
					break;
				case "antennaUpdated":
					this.antennas[this.antennas.findIndex((a) => a.id === body.id)] = {
						...body,
						createdAt: new Date(body.createdAt),
						lastUsedAt: new Date(body.lastUsedAt),
					};
					break;
				case "antennaDeleted":
					this.antennas = this.antennas.filter((a) => a.id !== body.id);
					break;
				default:
					break;
			}
		}
	}

	@bindThis
	public async addNoteToAntennas(
		note: Note,
		noteUser: { id: User["id"]; username: string; host: string | null },
	): Promise<void> {
		const antennas = await this.getAntennas();
		const antennasWithMatchResult = await Promise.all(
			antennas.map((antenna) =>
				this.checkHitAntenna(antenna, note, noteUser).then(
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

	// NOTE: フォローしているユーザーのノート、リストのユーザーのノート、グループのユーザーのノート指定はパフォーマンス上の理由で無効になっている

	@bindThis
	public async checkHitAntenna(
		antenna: Antenna,
		note: Note | Packed<"Note">,
		noteUser: { id: User["id"]; username: string; host: string | null },
	): Promise<boolean> {
		if (note.visibility === "specified") return false;
		if (note.visibility === "followers") return false;

		let userIds: string[] = [];
		if (antenna.users) {
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

	@bindThis
	public dispose(): void {
		this.redisForSub.off("message", this.onRedisMessage);
	}

	@bindThis
	public onApplicationShutdown(signal?: string | undefined): void {
		this.dispose();
	}
}
