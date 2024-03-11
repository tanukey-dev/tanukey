import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { UserPointsRepository } from '@/models/index.js';
import type { Packed } from '@/misc/json-schema.js';
import { IdService } from '@/core/IdService.js';
import type { } from '@/models/entities/Blocking.js';
import type { User } from '@/models/entities/User.js';
import { bindThis } from '@/decorators.js';
import { NotificationService } from '@/core/NotificationService.js';
import { pointTypes } from '@/types';

@Injectable()
export class UserPointService {
	constructor(
		@Inject(DI.userPointsRepository)
		private userPointsRepository: UserPointsRepository,

		private notificationService: NotificationService,
		private idService: IdService,
	) {
	}

	@bindThis
	public async add(
		userId: User['id'],
		addPoint: number,
	): Promise<void> {
		const point = await this.userPointsRepository.createQueryBuilder('point')
			.where('point.userId = :id', { id: userId })
			.getOne();
		if (point) {
			await this.userPointsRepository.update({ id: point.id }, {
				userId: userId,
				point: point.point + addPoint,
				updatedAtDailyFirstNote: new Date(),
			});
		} else {
			await this.userPointsRepository.insert({
				id: this.idService.genId(),
				userId: userId,
				point: addPoint,
				updatedAtDailyFirstNote: new Date(),
			});
		}
	}

	@bindThis
	public async addWhenDailyFirstNote(
		userId: User['id'],
		addPoint: number,
	): Promise<void> {
		const point = await this.userPointsRepository.createQueryBuilder('point')
			.where('point.userId = :id', { id: userId })
			.getOne();
		if (point) {
			const nowDate = new Date().getDate();
			const lastDate = point.updatedAtDailyFirstNote.getDate();
			if (nowDate === lastDate) {
				// 前回と日付が同じだったら加算しない
				return;
			}
			await this.userPointsRepository.update({ id: point.id }, {
				userId: userId,
				point: point.point + addPoint,
				updatedAtDailyFirstNote: new Date(),
			});
			this.notificationService.createNotification(userId, 'point', {
				point: addPoint,
				pointType: 'loginBonus',
			});
		} else {
			await this.userPointsRepository.insert({
				id: this.idService.genId(),
				userId: userId,
				point: addPoint,
				updatedAtDailyFirstNote: new Date(),
			});
			this.notificationService.createNotification(userId, 'point', {
				point: addPoint,
				pointType: 'loginBonus',
			});
		}
	}

	@bindThis
	public async send(
		myUserId: User['id'],
		targetUserId: User['id'],
		value: number,
	): Promise<void> {
		this.add(myUserId, -value);
		this.add(targetUserId, value);
		this.notificationService.createNotification(myUserId, 'point', {
			point: value,
			pointType: 'sendPoints',
			pointReceiveUserId: targetUserId,
		});
		this.notificationService.createNotification(targetUserId, 'point', {
			point: value,
			pointType: 'receivePoints',
			pointSendUserId: myUserId,
		});
	}

	@bindThis
	public async pack(
		userId: User['id'],
	): Promise<Packed<'UserPoint'>> {
		const point = await this.userPointsRepository.createQueryBuilder('point')
			.where('point.userId = :id', { id: userId })
			.getOne();
		if (!point) {
			return { point: 0, updatedAtDailyFirstNote: null };
		}
		return { point: point.point, updatedAtDailyFirstNote: point.updatedAtDailyFirstNote?.toISOString() ?? null };
	}
}

