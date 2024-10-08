import { bindThis } from "@/decorators.js";
import { DI } from "@/di-symbols.js";
import { Inject, Injectable } from "@nestjs/common";
import type { AdminChannelService } from "./channels/admin.js";
import type { AntennaChannelService } from "./channels/antenna.js";
import type { ChannelChannelService } from "./channels/channel.js";
import type { ChannelAntennaChannelService } from "./channels/channelAntenna.js";
import type { DriveChannelService } from "./channels/drive.js";
import type { HashtagChannelService } from "./channels/hashtag.js";
import type { HomeTimelineChannelService } from "./channels/home-timeline.js";
import type { HybridTimelineChannelService } from "./channels/hybrid-timeline.js";
import type { LocalTimelineChannelService } from "./channels/local-timeline.js";
import type { MainChannelService } from "./channels/main.js";
import type { QueueStatsChannelService } from "./channels/queue-stats.js";
import type { RoleTimelineChannelService } from "./channels/role-timeline.js";
import type { ServerStatsChannelService } from "./channels/server-stats.js";
import type { UserListChannelService } from "./channels/user-list.js";

@Injectable()
export class ChannelsService {
	constructor(
		@Inject(DI.mainChannelService)
		private mainChannelService: MainChannelService,
		@Inject(DI.homeTimelineChannelService)
		private homeTimelineChannelService: HomeTimelineChannelService,
		@Inject(DI.localTimelineChannelService)
		private localTimelineChannelService: LocalTimelineChannelService,
		@Inject(DI.hybridTimelineChannelService)
		private hybridTimelineChannelService: HybridTimelineChannelService,
		@Inject(DI.userListChannelService)
		private userListChannelService: UserListChannelService,
		@Inject(DI.hashtagChannelService)
		private hashtagChannelService: HashtagChannelService,
		@Inject(DI.roleTimelineChannelService)
		private roleTimelineChannelService: RoleTimelineChannelService,
		@Inject(DI.antennaChannelService)
		private antennaChannelService: AntennaChannelService,
		@Inject(DI.channelChannelService)
		private channelChannelService: ChannelChannelService,
		@Inject(DI.channelAntennaChannelService)
		private channelAntennaChannelService: ChannelAntennaChannelService,
		@Inject(DI.driveChannelService)
		private driveChannelService: DriveChannelService,
		@Inject(DI.serverStatsChannelService)
		private serverStatsChannelService: ServerStatsChannelService,
		@Inject(DI.queueStatsChannelService)
		private queueStatsChannelService: QueueStatsChannelService,
		@Inject(DI.adminChannelService)
		private adminChannelService: AdminChannelService,
	) {}

	@bindThis
	public getChannelService(name: string) {
		switch (name) {
			case "main":
				return this.mainChannelService;
			case "homeTimeline":
				return this.homeTimelineChannelService;
			case "localTimeline":
				return this.localTimelineChannelService;
			case "hybridTimeline":
				return this.hybridTimelineChannelService;
			case "userList":
				return this.userListChannelService;
			case "hashtag":
				return this.hashtagChannelService;
			case "roleTimeline":
				return this.roleTimelineChannelService;
			case "antenna":
				return this.antennaChannelService;
			case "channel":
				return this.channelChannelService;
			case "channelAntenna":
				return this.channelAntennaChannelService;
			case "drive":
				return this.driveChannelService;
			case "serverStats":
				return this.serverStatsChannelService;
			case "queueStats":
				return this.queueStatsChannelService;
			case "admin":
				return this.adminChannelService;

			default:
				throw new Error(`no such channel: ${name}`);
		}
	}
}
