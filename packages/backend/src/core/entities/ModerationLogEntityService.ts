import { Inject, Injectable } from "@nestjs/common";
import { DI } from "@/di-symbols.js";
import type { ModerationLogsRepository } from "@/models/Repositories.js";
import { awaitAll } from "@/misc/prelude/await-all.js";
import type {} from "@/models/entities/Blocking.js";
import type { ModerationLog } from "@/models/entities/ModerationLog.js";
import { UserEntityService } from "./UserEntityService.js";
import { bindThis } from "@/decorators.js";

@Injectable()
export class ModerationLogEntityService {
	constructor(
		@Inject(DI.moderationLogsRepository)
		private moderationLogsRepository: ModerationLogsRepository,

		private userEntityService: UserEntityService,
	) {}

	@bindThis
	public async pack(src: ModerationLog["id"] | ModerationLog) {
		const log =
			typeof src === "object"
				? src
				: await this.moderationLogsRepository.findOneByOrFail({ id: src });

		return await awaitAll({
			id: log.id,
			createdAt: log.createdAt.toISOString(),
			type: log.type,
			info: log.info,
			userId: log.userId,
			user: this.userEntityService.pack(log.user ?? log.userId, null, {
				detail: true,
			}),
		});
	}

	@bindThis
	public packMany(reports: any[]) {
		return Promise.all(reports.map((x) => this.pack(x)));
	}
}
