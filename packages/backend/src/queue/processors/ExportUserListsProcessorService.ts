import * as fs from "node:fs";
import { Inject, Injectable } from "@nestjs/common";
import { In } from "typeorm";
import { format as dateFormat } from "date-fns";
import { DI } from "@/di-symbols.js";
import type {
	UserListJoiningsRepository,
	UserListsRepository,
	UsersRepository,
} from "@/models/Repositories.js";
import type { Config } from "@/config.js";
import type Logger from "@/logger.js";
import { DriveService } from "@/core/DriveService.js";
import { createTemp } from "@/misc/create-temp.js";
import { UtilityService } from "@/core/UtilityService.js";
import { QueueLoggerService } from "../QueueLoggerService.js";
import type Bull from "bull";
import type { DbJobDataWithUser } from "../types.js";
import { bindThis } from "@/decorators.js";

@Injectable()
export class ExportUserListsProcessorService {
	private logger: Logger;

	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.userListsRepository)
		private userListsRepository: UserListsRepository,

		@Inject(DI.userListJoiningsRepository)
		private userListJoiningsRepository: UserListJoiningsRepository,

		private utilityService: UtilityService,
		private driveService: DriveService,
		private queueLoggerService: QueueLoggerService,
	) {
		this.logger =
			this.queueLoggerService.logger.createSubLogger("export-user-lists");
	}

	@bindThis
	public async process(
		job: Bull.Job<DbJobDataWithUser>,
		done: () => void,
	): Promise<void> {
		this.logger.info(`Exporting user lists of ${job.data.user.id} ...`);

		const user = await this.usersRepository.findOneBy({ id: job.data.user.id });
		if (user == null) {
			done();
			return;
		}

		const lists = await this.userListsRepository.findBy({
			userId: user.id,
		});

		// Create temp file
		const [path, cleanup] = await createTemp();

		this.logger.info(`Temp file is ${path}`);

		try {
			const stream = fs.createWriteStream(path, { flags: "a" });

			for (const list of lists) {
				const joinings = await this.userListJoiningsRepository.findBy({
					userListId: list.id,
				});
				const users = await this.usersRepository.findBy({
					id: In(joinings.map((j) => j.userId)),
				});

				for (const u of users) {
					const acct = this.utilityService.getFullApAccount(u.username, u.host);
					const content = `${list.name},${acct}`;
					await new Promise<void>((res, rej) => {
						stream.write(content + "\n", (err) => {
							if (err) {
								this.logger.error(err);
								rej(err);
							} else {
								res();
							}
						});
					});
				}
			}

			stream.end();
			this.logger.succ(`Exported to: ${path}`);

			const fileName =
				"user-lists-" + dateFormat(new Date(), "yyyy-MM-dd-HH-mm-ss") + ".csv";
			const driveFile = await this.driveService.addFile({
				user,
				path,
				name: fileName,
				force: true,
				ext: "csv",
			});

			this.logger.succ(`Exported to: ${driveFile.id}`);
		} finally {
			cleanup();
		}

		done();
	}
}
