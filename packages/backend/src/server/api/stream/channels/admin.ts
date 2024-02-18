import { Injectable } from '@nestjs/common';
import { bindThis } from '@/decorators.js';
import Channel from '../channel.js';

class AdminChannel extends Channel {
	public readonly chName = 'admin';
	public static shouldShare = true;
	public static requireCredential = true as const;
	public static kind = 'read:admin:stream';

	@bindThis
	public async init(params: any) {
		// Subscribe admin stream
		this.subscriber.on(`adminStream:${this.user!.id}`, data => {
			this.send(data);
		});
	}
}

@Injectable()
export class AdminChannelService {
	public readonly shouldShare = AdminChannel.shouldShare;
	public readonly requireCredential = AdminChannel.requireCredential;
	public readonly kind = AdminChannel.kind;

	constructor(
	) {
	}

	@bindThis
	public create(id: string, connection: Channel['connection']): AdminChannel {
		return new AdminChannel(
			id,
			connection,
		);
	}
}
