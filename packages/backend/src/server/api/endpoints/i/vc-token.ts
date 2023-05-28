import { Injectable } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { MetaService } from '@/core/MetaService.js';

export const meta = {
	requireCredential: true,

	secure: true,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		roomName: { type: 'string' },
		userName: { type: 'string' },
	},
	required: ['roomName', 'userName'],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		private metaService: MetaService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const instance = await this.metaService.fetch(true);

			if (!instance.liveKitApiKey || !instance.liveKitApiSecretKey) {
				throw new Error('livekit api key or secret key is not set');
			}

			const at = new AccessToken(instance.liveKitApiKey, instance.liveKitApiSecretKey, {
				identity: ps.userName,
			});

			at.addGrant({ roomJoin: true, room: ps.roomName });

			return {
				token: at.toJwt(),
			};
		});
	}
}
