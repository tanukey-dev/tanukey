import { Inject, Injectable } from "@nestjs/common";
import { DI } from "@/di-symbols.js";
import type { AntennasRepository } from "@/models/Repositories.js";
import type { Packed } from "@/misc/json-schema.js";
import type { Antenna } from "@/models/entities/Antenna.js";
import { bindThis } from "@/decorators.js";

@Injectable()
export class AntennaEntityService {
	constructor(
		@Inject(DI.antennasRepository)
		private antennasRepository: AntennasRepository,
	) {}

	@bindThis
	public async pack(src: Antenna["id"] | Antenna): Promise<Packed<"Antenna">> {
		const antenna =
			typeof src === "object"
				? src
				: await this.antennasRepository.findOneByOrFail({ id: src });

		return {
			id: antenna.id,
			createdAt: antenna.createdAt.toISOString(),
			name: antenna.name,
			keywords: antenna.keywords,
			excludeKeywords: antenna.excludeKeywords,
			src: antenna.src,
			userListId: antenna.userListId,
			users: antenna.users,
			caseSensitive: antenna.caseSensitive,
			localOnly: antenna.localOnly,
			notify: antenna.notify,
			withReplies: antenna.withReplies,
			withFile: antenna.withFile,
			isActive: antenna.isActive,
			hasUnreadNote: false, // TODO
		};
	}
}
