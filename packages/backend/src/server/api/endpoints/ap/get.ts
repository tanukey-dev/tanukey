/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import ms from 'ms';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { ApResolverService } from '@/core/activitypub/ApResolverService.js';
import { MetaService } from '@/core/MetaService.js';
import { UtilityService } from '@/core/UtilityService.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['federation'],

	requireCredential: true,
	kind: 'read:federation',

	limit: {
		duration: ms('1hour'),
		max: 30,
	},

	errors: {
		serverNotAllowed: {
			message: 'Server is not allowed. Please ask your administrator.',
			code: 'SERVER_NOT_ALLOWED',
			id: 'dc94d745-1263-4e63-a17d-fecaa57efc82',
		},
		serverBlocked: {
			message: 'Server is blocked.',
			code: 'SERVER_BLOCKED',
			id: 'dc94d745-1264-4e63-a17d-fecaa57efc82',
		},
	},

	res: {
		type: 'object',
		optional: false, nullable: false,
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		uri: { type: 'string' },
	},
	required: ['uri'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private apResolverService: ApResolverService,
		private utilityService: UtilityService,
		private metaService: MetaService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const fetchedMeta = await this.metaService.fetch();
			// 許可されてなかったら中断
			if (fetchedMeta.enableAllowedHostsInWhiteList) {
				if (!this.utilityService.isAllowedHost(fetchedMeta.allowedHosts, this.utilityService.extractDbHost(ps.uri))) throw new ApiError(meta.errors.serverNotAllowed);
			}
			// ブロックしてたら中断
			if (this.utilityService.isBlockedHost(fetchedMeta.blockedHosts, this.utilityService.extractDbHost(ps.uri))) throw new ApiError(meta.errors.serverBlocked);

			const resolver = this.apResolverService.createResolver();
			const object = await resolver.resolve(ps.uri);
			return object;
		});
	}
}
