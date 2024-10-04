import { CoreModule } from "@/core/CoreModule.js";
import { StripeWebhookServerService } from "@/server/StripeWebhookServerService.js";
import { EndpointsModule } from "@/server/api/EndpointsModule.js";
import { Module } from "@nestjs/common";
import type { Provider } from "@nestjs/common";
import { ActivityPubServerService } from "./ActivityPubServerService.js";
import { FileServerService } from "./FileServerService.js";
import { NodeinfoServerService } from "./NodeinfoServerService.js";
import { ServerService } from "./ServerService.js";
import { WellKnownServerService } from "./WellKnownServerService.js";
import { ApiCallService } from "./api/ApiCallService.js";
import { ApiLoggerService } from "./api/ApiLoggerService.js";
import { ApiServerService } from "./api/ApiServerService.js";
import { AuthenticateService } from "./api/AuthenticateService.js";
import { GetterService } from "./api/GetterService.js";
import { RateLimiterService } from "./api/RateLimiterService.js";
import { SigninApiService } from "./api/SigninApiService.js";
import { SigninService } from "./api/SigninService.js";
import { SignupApiService } from "./api/SignupApiService.js";
import { StreamingApiServerService } from "./api/StreamingApiServerService.js";
import { OpenApiServerService } from "./api/openapi/OpenApiServerService.js";
import { ChannelsService } from "./api/stream/ChannelsService.js";
import { AdminChannelService } from "./api/stream/channels/admin.js";
import { AntennaChannelService } from "./api/stream/channels/antenna.js";
import { ChannelChannelService } from "./api/stream/channels/channel.js";
import { DriveChannelService } from "./api/stream/channels/drive.js";
import { HashtagChannelService } from "./api/stream/channels/hashtag.js";
import { HomeTimelineChannelService } from "./api/stream/channels/home-timeline.js";
import { HybridTimelineChannelService } from "./api/stream/channels/hybrid-timeline.js";
import { LocalTimelineChannelService } from "./api/stream/channels/local-timeline.js";
import { MainChannelService } from "./api/stream/channels/main.js";
import { QueueStatsChannelService } from "./api/stream/channels/queue-stats.js";
import { RoleTimelineChannelService } from "./api/stream/channels/role-timeline.js";
import { ServerStatsChannelService } from "./api/stream/channels/server-stats.js";
import { UserListChannelService } from "./api/stream/channels/user-list.js";
import { ClientLoggerService } from "./web/ClientLoggerService.js";
import { ClientServerService } from "./web/ClientServerService.js";
import { FeedService } from "./web/FeedService.js";
import { UrlPreviewService } from "./web/UrlPreviewService.js";

const $ClientServerService: Provider = {
	provide: "ClientServerService",
	useExisting: ClientServerService,
};
const $ClientLoggerService: Provider = {
	provide: "ClientLoggerService",
	useExisting: ClientLoggerService,
};
const $FeedService: Provider = {
	provide: "FeedService",
	useExisting: FeedService,
};
const $UrlPreviewService: Provider = {
	provide: "UrlPreviewService",
	useExisting: UrlPreviewService,
};
const $ActivityPubServerService: Provider = {
	provide: "ActivityPubServerService",
	useExisting: ActivityPubServerService,
};
const $FileServerService: Provider = {
	provide: "FileServerService",
	useExisting: FileServerService,
};
const $NodeinfoServerService: Provider = {
	provide: "NodeinfoServerService",
	useExisting: NodeinfoServerService,
};
const $ServerService: Provider = {
	provide: "ServerService",
	useExisting: ServerService,
};
const $WellKnownServerService: Provider = {
	provide: "WellKnownServerService",
	useExisting: WellKnownServerService,
};
const $GetterService: Provider = {
	provide: "GetterService",
	useExisting: GetterService,
};
const $ChannelsService: Provider = {
	provide: "ChannelsService",
	useExisting: ChannelsService,
};
const $ApiCallService: Provider = {
	provide: "ApiCallService",
	useExisting: ApiCallService,
};
const $ApiLoggerService: Provider = {
	provide: "ApiLoggerService",
	useExisting: ApiLoggerService,
};
const $ApiServerService: Provider = {
	provide: "ApiServerService",
	useExisting: ApiServerService,
};
const $AuthenticateService: Provider = {
	provide: "AuthenticateService",
	useExisting: AuthenticateService,
};
const $RateLimiterService: Provider = {
	provide: "RateLimiterService",
	useExisting: RateLimiterService,
};
const $SigninApiService: Provider = {
	provide: "SigninApiService",
	useExisting: SigninApiService,
};
const $SigninService: Provider = {
	provide: "SigninService",
	useExisting: SigninService,
};
const $SignupApiService: Provider = {
	provide: "SignupApiService",
	useExisting: SignupApiService,
};
const $StreamingApiServerService: Provider = {
	provide: "StreamingApiServerService",
	useExisting: StreamingApiServerService,
};
const $MainChannelService: Provider = {
	provide: "MainChannelService",
	useExisting: MainChannelService,
};
const $AdminChannelService: Provider = {
	provide: "AdminChannelService",
	useExisting: AdminChannelService,
};
const $AntennaChannelService: Provider = {
	provide: "AntennaChannelService",
	useExisting: AntennaChannelService,
};
const $ChannelChannelService: Provider = {
	provide: "ChannelChannelService",
	useExisting: ChannelChannelService,
};
const $DriveChannelService: Provider = {
	provide: "DriveChannelService",
	useExisting: DriveChannelService,
};
const $HashtagChannelService: Provider = {
	provide: "HashtagChannelService",
	useExisting: HashtagChannelService,
};
const $RoleTimelineChannelService: Provider = {
	provide: "RoleTimelineChannelService",
	useExisting: RoleTimelineChannelService,
};
const $HomeTimelineChannelService: Provider = {
	provide: "HomeTimelineChannelService",
	useExisting: HomeTimelineChannelService,
};
const $HybridTimelineChannelService: Provider = {
	provide: "HybridTimelineChannelService",
	useExisting: HybridTimelineChannelService,
};
const $LocalTimelineChannelService: Provider = {
	provide: "LocalTimelineChannelService",
	useExisting: LocalTimelineChannelService,
};
const $QueueStatsChannelService: Provider = {
	provide: "QueueStatsChannelService",
	useExisting: QueueStatsChannelService,
};
const $ServerStatsChannelService: Provider = {
	provide: "ServerStatsChannelService",
	useExisting: ServerStatsChannelService,
};
const $UserListChannelService: Provider = {
	provide: "UserListChannelService",
	useExisting: UserListChannelService,
};
const $OpenApiServerService: Provider = {
	provide: "OpenApiServerService",
	useExisting: OpenApiServerService,
};
const $StripeWebhookServerService: Provider = {
	provide: "StripeWebhookServerService",
	useExisting: StripeWebhookServerService,
};

@Module({
	imports: [EndpointsModule, CoreModule],
	providers: [
		ClientServerService,
		ClientLoggerService,
		FeedService,
		UrlPreviewService,
		ActivityPubServerService,
		FileServerService,
		NodeinfoServerService,
		ServerService,
		WellKnownServerService,
		GetterService,
		ChannelsService,
		ApiCallService,
		ApiLoggerService,
		ApiServerService,
		AuthenticateService,
		RateLimiterService,
		SigninApiService,
		SigninService,
		SignupApiService,
		StreamingApiServerService,
		MainChannelService,
		AdminChannelService,
		AntennaChannelService,
		ChannelChannelService,
		DriveChannelService,
		HashtagChannelService,
		RoleTimelineChannelService,
		HomeTimelineChannelService,
		HybridTimelineChannelService,
		LocalTimelineChannelService,
		QueueStatsChannelService,
		ServerStatsChannelService,
		UserListChannelService,
		OpenApiServerService,
		StripeWebhookServerService,

		//#region 文字列ベースでのinjection用(循環参照対応のため)
		$ClientServerService,
		$ClientLoggerService,
		$FeedService,
		$UrlPreviewService,
		$ActivityPubServerService,
		$FileServerService,
		$NodeinfoServerService,
		$ServerService,
		$WellKnownServerService,
		$GetterService,
		$ChannelsService,
		$ApiCallService,
		$ApiLoggerService,
		$ApiServerService,
		$AuthenticateService,
		$RateLimiterService,
		$SigninApiService,
		$SigninService,
		$SignupApiService,
		$StreamingApiServerService,
		$MainChannelService,
		$AdminChannelService,
		$AntennaChannelService,
		$ChannelChannelService,
		$DriveChannelService,
		$HashtagChannelService,
		$RoleTimelineChannelService,
		$HomeTimelineChannelService,
		$HybridTimelineChannelService,
		$LocalTimelineChannelService,
		$QueueStatsChannelService,
		$ServerStatsChannelService,
		$UserListChannelService,
		$OpenApiServerService,
		$StripeWebhookServerService,
	],
	exports: [ServerService],
})
export class ServerModule {}
