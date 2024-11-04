import { Inject, Injectable } from "@nestjs/common";
import { DI } from "@/di-symbols.js";
import type { FollowRequestsRepository } from "@/models/Repositories.js";
import type {} from "@/models/entities/Blocking.js";
import type { User } from "@/models/entities/User.js";
import type { FollowRequest } from "@/models/entities/FollowRequest.js";
import { UserEntityService } from "./UserEntityService.js";
import { bindThis } from "@/decorators.js";

@Injectable()
export class FollowRequestEntityService {
	constructor(
		@Inject(DI.followRequestsRepository)
		private followRequestsRepository: FollowRequestsRepository,

		private userEntityService: UserEntityService,
	) {}

	@bindThis
	public async pack(
		src: FollowRequest["id"] | FollowRequest,
		me?: { id: User["id"] } | null | undefined,
	) {
		const request =
			typeof src === "object"
				? src
				: await this.followRequestsRepository.findOneByOrFail({ id: src });

		return {
			id: request.id,
			follower: await this.userEntityService.pack(request.followerId, me),
			followee: await this.userEntityService.pack(request.followeeId, me),
		};
	}
}
