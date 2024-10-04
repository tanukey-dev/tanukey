import { bindThis } from "@/decorators.js";
import { Injectable } from "@nestjs/common";
import { AdminChannelService } from "./channels/admin.js";
import { AntennaChannelService } from "./channels/antenna.js";
import { ChannelChannelService } from "./channels/channel.js";
import { DriveChannelService } from "./channels/drive.js";
import { GlobalTimelineChannelService } from "./channels/global-timeline.js";
import { HashtagChannelService } from "./channels/hashtag.js";
import { HomeTimelineChannelService } from "./channels/home-timeline.js";
import { HybridTimelineChannelService } from "./channels/hybrid-timeline.js";
import { LocalTimelineChannelService } from "./channels/local-timeline.js";
import { MainChannelService } from "./channels/main.js";
import { MediaTimelineChannelService } from "./channels/media-timeline.js";
import { QueueStatsChannelService } from "./channels/queue-stats.js";
import { RoleTimelineChannelService } from "./channels/role-timeline.js";
import { ServerStatsChannelService } from "./channels/server-stats.js";
import { UserListChannelService } from "./channels/user-list.js";

@Injectable()
export class ChannelsService {
	constructor(
		private mainChannelService: MainChannelService,
		private homeTimelineChannelService: HomeTimelineChannelService,
		private localTimelineChannelService: LocalTimelineChannelService,
		private mediaTimelineChannelService: MediaTimelineChannelService,
		private hybridTimelineChannelService: HybridTimelineChannelService,
		private globalTimelineChannelService: GlobalTimelineChannelService,
		private userListChannelService: UserListChannelService,
		private hashtagChannelService: HashtagChannelService,
		private roleTimelineChannelService: RoleTimelineChannelService,
		private antennaChannelService: AntennaChannelService,
		private channelChannelService: ChannelChannelService,
		private driveChannelService: DriveChannelService,
		private serverStatsChannelService: ServerStatsChannelService,
		private queueStatsChannelService: QueueStatsChannelService,
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
			case "mediaTimeline":
				return this.mediaTimelineChannelService;
			case "hybridTimeline":
				return this.hybridTimelineChannelService;
			case "globalTimeline":
				return this.globalTimelineChannelService;
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
