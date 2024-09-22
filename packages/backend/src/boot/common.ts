import { NestFactory } from "@nestjs/core";
import { ChartManagementService } from "@/core/chart/ChartManagementService.js";
import { QueueProcessorService } from "@/queue/QueueProcessorService.js";
import { NestLogger } from "@/NestLogger.js";
import { QueueProcessorModule } from "@/queue/QueueProcessorModule.js";
import { JanitorService } from "@/daemons/JanitorService.js";
import { QueueStatsService } from "@/daemons/QueueStatsService.js";
import { ServerStatsService } from "@/daemons/ServerStatsService.js";
import { ServerService } from "@/server/ServerService.js";
import { MainModule } from "@/MainModule.js";

export async function server() {
	const app = await NestFactory.createApplicationContext(MainModule, {
		logger: new NestLogger(),
	});
	app.enableShutdownHooks();

	const serverService = app.get(ServerService);
	await serverService.launch();

	if (process.env.NODE_ENV !== "test") {
		app.get(ChartManagementService).start();
		app.get(JanitorService).start();
		app.get(QueueStatsService).start();
		app.get(ServerStatsService).start();
	}

	return app;
}

export async function jobQueue() {
	const jobQueue = await NestFactory.createApplicationContext(
		QueueProcessorModule,
		{
			logger: new NestLogger(),
		},
	);
	jobQueue.enableShutdownHooks();

	jobQueue.get(QueueProcessorService).start();
	jobQueue.get(ChartManagementService).start();

	return jobQueue;
}
