import { GlobalModule } from "@/GlobalModule.js";
import { CoreModule } from "@/core/CoreModule.js";
import { Module } from "@nestjs/common";
import { QueueLoggerService } from "./QueueLoggerService.js";
import { QueueProcessorService } from "./QueueProcessorService.js";
import { AggregateRetentionProcessorService } from "./processors/AggregateRetentionProcessorService.js";
import { CheckExpiredMutingsProcessorService } from "./processors/CheckExpiredMutingsProcessorService.js";
import { CleanChartsProcessorService } from "./processors/CleanChartsProcessorService.js";
import { CleanProcessorService } from "./processors/CleanProcessorService.js";
import { CleanRemoteFilesProcessorService } from "./processors/CleanRemoteFilesProcessorService.js";
import { DeleteAccountProcessorService } from "./processors/DeleteAccountProcessorService.js";
import { DeleteDriveFilesProcessorService } from "./processors/DeleteDriveFilesProcessorService.js";
import { DeleteFileProcessorService } from "./processors/DeleteFileProcessorService.js";
import { DeliverProcessorService } from "./processors/DeliverProcessorService.js";
import { EndedPollNotificationProcessorService } from "./processors/EndedPollNotificationProcessorService.js";
import { ExportAntennasProcessorService } from "./processors/ExportAntennasProcessorService.js";
import { ExportBlockingProcessorService } from "./processors/ExportBlockingProcessorService.js";
import { ExportCustomEmojisProcessorService } from "./processors/ExportCustomEmojisProcessorService.js";
import { ExportFavoritesProcessorService } from "./processors/ExportFavoritesProcessorService.js";
import { ExportFollowingProcessorService } from "./processors/ExportFollowingProcessorService.js";
import { ExportMutingProcessorService } from "./processors/ExportMutingProcessorService.js";
import { ExportNotesProcessorService } from "./processors/ExportNotesProcessorService.js";
import { ExportUserListsProcessorService } from "./processors/ExportUserListsProcessorService.js";
import { ImportAntennasProcessorService } from "./processors/ImportAntennasProcessorService.js";
import { ImportBlockingProcessorService } from "./processors/ImportBlockingProcessorService.js";
import { ImportFollowingProcessorService } from "./processors/ImportFollowingProcessorService.js";
import { ImportMutingProcessorService } from "./processors/ImportMutingProcessorService.js";
import { ImportUserListsProcessorService } from "./processors/ImportUserListsProcessorService.js";
import { InboxProcessorService } from "./processors/InboxProcessorService.js";
import { RelationshipProcessorService } from "./processors/RelationshipProcessorService.js";
import { ResyncChartsProcessorService } from "./processors/ResyncChartsProcessorService.js";
import { TickChartsProcessorService } from "./processors/TickChartsProcessorService.js";
import { WebhookDeliverProcessorService } from "./processors/WebhookDeliverProcessorService.js";

@Module({
	imports: [GlobalModule, CoreModule],
	providers: [
		QueueLoggerService,
		TickChartsProcessorService,
		ResyncChartsProcessorService,
		CleanChartsProcessorService,
		CheckExpiredMutingsProcessorService,
		CleanProcessorService,
		DeleteDriveFilesProcessorService,
		ExportCustomEmojisProcessorService,
		ExportNotesProcessorService,
		ExportFavoritesProcessorService,
		ExportFollowingProcessorService,
		ExportMutingProcessorService,
		ExportBlockingProcessorService,
		ExportUserListsProcessorService,
		ExportAntennasProcessorService,
		ImportFollowingProcessorService,
		ImportMutingProcessorService,
		ImportBlockingProcessorService,
		ImportUserListsProcessorService,
		ImportAntennasProcessorService,
		DeleteAccountProcessorService,
		DeleteFileProcessorService,
		CleanRemoteFilesProcessorService,
		RelationshipProcessorService,
		WebhookDeliverProcessorService,
		EndedPollNotificationProcessorService,
		DeliverProcessorService,
		InboxProcessorService,
		AggregateRetentionProcessorService,
		QueueProcessorService,
	],
	exports: [QueueProcessorService],
})
export class QueueProcessorModule {}
