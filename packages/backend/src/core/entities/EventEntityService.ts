import { Inject, Injectable } from "@nestjs/common";
import { DI } from "@/di-symbols.js";
import type {
	EventsRepository,
	DriveFilesRepository,
} from "@/models/Repositories.js";
import type { Packed } from "@/misc/json-schema.js";
import type {} from "@/models/entities/Blocking.js";
import type { User } from "@/models/entities/User.js";
import type { Event } from "@/models/entities/Event.js";
import { bindThis } from "@/decorators.js";
import { DriveFileEntityService } from "./DriveFileEntityService.js";
import { In } from "typeorm";

@Injectable()
export class EventEntityService {
	constructor(
		@Inject(DI.eventsRepository)
		private eventsRepository: EventsRepository,

		@Inject(DI.driveFilesRepository)
		private driveFilesRepository: DriveFilesRepository,

		private driveFileEntityService: DriveFileEntityService,
	) {}

	@bindThis
	public async pack(
		src: Event["id"] | Event,
		me?: { id: User["id"] } | null | undefined,
		detailed?: boolean,
	): Promise<Packed<"Event">> {
		const event =
			typeof src === "object"
				? src
				: await this.eventsRepository.findOneByOrFail({ id: src });
		const meId = me ? me.id : null;

		const banner = event.bannerId
			? await this.driveFilesRepository.findOneBy({ id: event.bannerId })
			: null;

		const localTime = new Date();
		const localTimeDiff = localTime.getTimezoneOffset() * 60 * 1000;
		event.expiresAt?.setMilliseconds(
			event.expiresAt.getMilliseconds() - localTimeDiff,
		);
		event.startsAt?.setMilliseconds(
			event.startsAt.getMilliseconds() - localTimeDiff,
		);

		return {
			id: event.id,
			createdAt: event.createdAt.toISOString(),
			userId: event.userId,
			name: event.name,
			description: event.description,
			bannerId: banner ? banner.id : null,
			bannerUrl: banner
				? this.driveFileEntityService.getPublicUrl(banner)
				: null,
			expiresAt: event.expiresAt
				? event.expiresAt.toISOString().slice(0, 16)
				: null,
			startsAt: event.startsAt
				? event.startsAt.toISOString().slice(0, 16)
				: null,
			pageId: event.pageId,
		};
	}
}
