import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { IdService } from "@/core/IdService.js";
import type { User } from "@/models/entities/User.js";
import type { Blocking } from "@/models/entities/Blocking.js";
import { QueueService } from "@/core/QueueService.js";
import { GlobalEventService } from "@/core/GlobalEventService.js";
import { DI } from "@/di-symbols.js";
import type {
	FollowRequestsRepository,
	BlockingsRepository,
	UserListsRepository,
	UserListJoiningsRepository,
} from "@/models/Repositories.js";
import Logger from "@/logger.js";
import { UserEntityService } from "@/core/entities/UserEntityService.js";
import { ApRendererService } from "@/core/activitypub/ApRendererService.js";
import { LoggerService } from "@/core/LoggerService.js";
import { WebhookService } from "@/core/WebhookService.js";
import { bindThis } from "@/decorators.js";
import { CacheService } from "@/core/CacheService.js";
import { UserFollowingService } from "@/core/UserFollowingService.js";

@Injectable()
export class UserBlockingService implements OnModuleInit {
	private logger: Logger;
	private userFollowingService: UserFollowingService;

	constructor(
		private moduleRef: ModuleRef,

		@Inject(DI.followRequestsRepository)
		private followRequestsRepository: FollowRequestsRepository,

		@Inject(DI.blockingsRepository)
		private blockingsRepository: BlockingsRepository,

		@Inject(DI.userListsRepository)
		private userListsRepository: UserListsRepository,

		@Inject(DI.userListJoiningsRepository)
		private userListJoiningsRepository: UserListJoiningsRepository,

		private cacheService: CacheService,
		private userEntityService: UserEntityService,
		private idService: IdService,
		private queueService: QueueService,
		private globalEventService: GlobalEventService,
		private webhookService: WebhookService,
		private apRendererService: ApRendererService,
		private loggerService: LoggerService,
	) {
		this.logger = this.loggerService.getLogger("user-block");
	}

	onModuleInit() {
		this.userFollowingService = this.moduleRef.get("UserFollowingService");
	}

	@bindThis
	public async block(blocker: User, blockee: User, silent = false) {
		await Promise.all([
			this.cancelRequest(blocker, blockee, silent),
			this.cancelRequest(blockee, blocker, silent),
			this.userFollowingService.unfollow(blocker, blockee, silent),
			this.userFollowingService.unfollow(blockee, blocker, silent),
			this.removeFromList(blockee, blocker),
		]);

		const blocking = {
			id: this.idService.genId(),
			createdAt: new Date(),
			blocker,
			blockerId: blocker.id,
			blockee,
			blockeeId: blockee.id,
		} as Blocking;

		await this.blockingsRepository.insert(blocking);

		this.cacheService.userBlockingCache.refresh(blocker.id);
		this.cacheService.userBlockedCache.refresh(blockee.id);

		this.globalEventService.publishInternalEvent("blockingCreated", {
			blockerId: blocker.id,
			blockeeId: blockee.id,
		});

		if (
			this.userEntityService.isLocalUser(blocker) &&
			this.userEntityService.isRemoteUser(blockee)
		) {
			const content = this.apRendererService.addContext(
				this.apRendererService.renderBlock(blocking),
			);
			this.queueService.deliver(blocker, content, blockee.inbox, false);
		}
	}

	@bindThis
	private async cancelRequest(follower: User, followee: User, silent = false) {
		const request = await this.followRequestsRepository.findOneBy({
			followeeId: followee.id,
			followerId: follower.id,
		});

		if (request == null) {
			return;
		}

		await this.followRequestsRepository.delete({
			followeeId: followee.id,
			followerId: follower.id,
		});

		if (this.userEntityService.isLocalUser(followee)) {
			this.userEntityService
				.pack(followee, followee, {
					detail: true,
				})
				.then((packed) =>
					this.globalEventService.publishMainStream(
						followee.id,
						"meUpdated",
						packed,
					),
				);
		}

		if (this.userEntityService.isLocalUser(follower) && !silent) {
			this.userEntityService
				.pack(followee, follower, {
					detail: true,
				})
				.then(async (packed) => {
					this.globalEventService.publishMainStream(
						follower.id,
						"unfollow",
						packed,
					);

					const webhooks = (
						await this.webhookService.getActiveWebhooks()
					).filter(
						(x) => x.userId === follower.id && x.on.includes("unfollow"),
					);
					for (const webhook of webhooks) {
						this.queueService.webhookDeliver(webhook, "unfollow", {
							user: packed,
						});
					}
				});
		}

		// リモートにフォローリクエストをしていたらUndoFollow送信
		if (
			this.userEntityService.isLocalUser(follower) &&
			this.userEntityService.isRemoteUser(followee)
		) {
			const content = this.apRendererService.addContext(
				this.apRendererService.renderUndo(
					this.apRendererService.renderFollow(follower, followee),
					follower,
				),
			);
			this.queueService.deliver(follower, content, followee.inbox, false);
		}

		// リモートからフォローリクエストを受けていたらReject送信
		if (
			this.userEntityService.isRemoteUser(follower) &&
			this.userEntityService.isLocalUser(followee)
		) {
			const content = this.apRendererService.addContext(
				this.apRendererService.renderReject(
					this.apRendererService.renderFollow(
						follower,
						followee,
						request.requestId!,
					),
					followee,
				),
			);
			this.queueService.deliver(followee, content, follower.inbox, false);
		}
	}

	@bindThis
	private async removeFromList(listOwner: User, user: User) {
		const userLists = await this.userListsRepository.findBy({
			userId: listOwner.id,
		});

		for (const userList of userLists) {
			await this.userListJoiningsRepository.delete({
				userListId: userList.id,
				userId: user.id,
			});
		}
	}

	@bindThis
	public async unblock(blocker: User, blockee: User) {
		const blocking = await this.blockingsRepository.findOneBy({
			blockerId: blocker.id,
			blockeeId: blockee.id,
		});

		if (blocking == null) {
			this.logger.warn(
				"ブロック解除がリクエストされましたがブロックしていませんでした",
			);
			return;
		}

		// Since we already have the blocker and blockee, we do not need to fetch
		// them in the query above and can just manually insert them here.
		blocking.blocker = blocker;
		blocking.blockee = blockee;

		await this.blockingsRepository.delete(blocking.id);

		this.cacheService.userBlockingCache.refresh(blocker.id);
		this.cacheService.userBlockedCache.refresh(blockee.id);

		this.globalEventService.publishInternalEvent("blockingDeleted", {
			blockerId: blocker.id,
			blockeeId: blockee.id,
		});

		// deliver if remote bloking
		if (
			this.userEntityService.isLocalUser(blocker) &&
			this.userEntityService.isRemoteUser(blockee)
		) {
			const content = this.apRendererService.addContext(
				this.apRendererService.renderUndo(
					this.apRendererService.renderBlock(blocking),
					blocker,
				),
			);
			this.queueService.deliver(blocker, content, blockee.inbox, false);
		}
	}

	@bindThis
	public async checkBlocked(
		blockerId: User["id"],
		blockeeId: User["id"],
	): Promise<boolean> {
		return (await this.cacheService.userBlockingCache.fetch(blockerId)).has(
			blockeeId,
		);
	}
}
