/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import type { AbuseUserReportsRepository } from '@/models/_.js';
import { awaitAll } from '@/misc/prelude/await-all.js';
import type { MiAbuseUserReport } from '@/models/AbuseUserReport.js';
import { bindThis } from '@/decorators.js';
import { Packed } from '@/misc/json-schema.js';
import type { MiUser } from '@/models/entities/User.js';
import { IdService } from '@/core/IdService.js';
import { UserEntityService } from './UserEntityService.js';

@Injectable()
export class AbuseUserReportEntityService {
	constructor(
		@Inject(DI.abuseUserReportsRepository)
		private abuseUserReportsRepository: AbuseUserReportsRepository,

		private userEntityService: UserEntityService,
		private idService: IdService,
	) {
	}

	@bindThis
	public async pack(
		src: MiAbuseUserReport['id'] | MiAbuseUserReport,
		me: { id: MiUser['id'] } | null | undefined,
	) : Promise<Packed<'AbuseUserReport'>> {
		const report = typeof src === 'object' ? src : await this.abuseUserReportsRepository.findOneByOrFail({ id: src });

		return await awaitAll({
			id: report.id,
			createdAt: this.idService.parse(report.id).date.toISOString(),
			comment: report.comment,
			resolved: report.resolved,
			reporterId: report.reporterId,
			targetUserId: report.targetUserId,
			assigneeId: report.assigneeId,
			reporter: this.userEntityService.pack(report.reporter ?? report.reporterId, me, {
				schema: 'UserDetailed',
			}),
			targetUser: this.userEntityService.pack(report.targetUser ?? report.targetUserId, me, {
				schema: 'UserDetailed',
			}),
			assignee: report.assigneeId ? this.userEntityService.pack(report.assignee ?? report.assigneeId, me, {
				schema: 'UserDetailed',
			}) : null,
			forwarded: report.forwarded,
			category: report.category,
		});
	}

	@bindThis
	public async packMany(
		reports: (MiAbuseUserReport['id'] | MiAbuseUserReport)[],
		me: { id: MiUser['id'] } | null | undefined,
	) : Promise<Packed<'AbuseUserReport'>[]> {
		return (await Promise.allSettled(reports.map(x => this.pack(x, me))))
			.filter(result => result.status === 'fulfilled')
			.map(result => (result as PromiseFulfilledResult<Packed<'AbuseUserReport'>>).value);
	}
}
