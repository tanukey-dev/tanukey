import { EventEmitter } from "node:events";
import type * as http from "node:http";
import type { ParsedUrlQuery } from "node:querystring";
import type { Config } from "@/config.js";
import type { CacheService } from "@/core/CacheService.js";
import type { NoteReadService } from "@/core/NoteReadService.js";
import type { NotificationService } from "@/core/NotificationService.js";
import { bindThis } from "@/decorators.js";
import { DI } from "@/di-symbols.js";
import type {
	BlockingsRepository,
	ChannelFollowingsRepository,
	FollowingsRepository,
	MutingsRepository,
	RenoteMutingsRepository,
	UserProfilesRepository,
	UsersRepository,
} from "@/models/Repositories.js";
import { Inject, Injectable } from "@nestjs/common";
import type * as Redis from "ioredis";
import * as websocket from "websocket";
import type { AuthenticateService } from "./AuthenticateService.js";
import type { ChannelsService } from "./stream/ChannelsService.js";
import MainStreamConnection from "./stream/Connection.js";

@Injectable()
export class StreamingApiServerService {
	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.redisForSub)
		private redisForSub: Redis.Redis,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.followingsRepository)
		private followingsRepository: FollowingsRepository,

		@Inject(DI.mutingsRepository)
		private mutingsRepository: MutingsRepository,

		@Inject(DI.renoteMutingsRepository)
		private renoteMutingsRepository: RenoteMutingsRepository,

		@Inject(DI.blockingsRepository)
		private blockingsRepository: BlockingsRepository,

		@Inject(DI.channelFollowingsRepository)
		private channelFollowingsRepository: ChannelFollowingsRepository,

		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		@Inject(DI.cacheService)
		private cacheService: CacheService,

		@Inject(DI.noteReadService)
		private noteReadService: NoteReadService,

		@Inject(DI.authenticateService)
		private authenticateService: AuthenticateService,

		@Inject(DI.channelsService)
		private channelsService: ChannelsService,

		@Inject(DI.notificationService)
		private notificationService: NotificationService,
	) {}

	@bindThis
	public attachStreamingApi(server: http.Server) {
		// Init websocket server
		const ws = new websocket.server({
			httpServer: server,
		});

		ws.on("request", async (request) => {
			const q = request.resourceURL.query as ParsedUrlQuery;

			// TODO: トークンが間違ってるなどしてauthenticateに失敗したら
			// コネクション切断するなりエラーメッセージ返すなりする
			// (現状はエラーがキャッチされておらずサーバーのログに流れて邪魔なので)
			const [user, miapp] = await this.authenticateService.authenticate(
				q.i as string,
			);

			if (miapp && !miapp.permission.some((p) => p === "read:account")) {
				request.reject(400);
				return;
			}

			if (user?.isSuspended) {
				request.reject(400);
				return;
			}

			const ev = new EventEmitter();

			async function onRedisMessage(_: string, data: string): Promise<void> {
				const parsed = JSON.parse(data);
				ev.emit(parsed.channel, parsed.message);
			}

			this.redisForSub.on("message", onRedisMessage);

			const main = new MainStreamConnection(
				this.channelsService,
				this.noteReadService,
				this.notificationService,
				this.cacheService,
				ev,
				user,
				miapp,
			);

			await main.init();

			const connection = request.accept();

			main.init2(connection);

			const intervalId = user
				? setInterval(
						() => {
							this.usersRepository.update(user.id, {
								lastActiveDate: new Date(),
							});
						},
						1000 * 60 * 5,
					)
				: null;
			if (user) {
				this.usersRepository.update(user.id, {
					lastActiveDate: new Date(),
				});
			}

			connection.once("close", () => {
				ev.removeAllListeners();
				main.dispose();
				this.redisForSub.off("message", onRedisMessage);
				if (intervalId) clearInterval(intervalId);
			});

			connection.on("message", async (data) => {
				if (data.type === "utf8" && data.utf8Data === "ping") {
					connection.send("pong");
				}
			});
		});
	}
}
