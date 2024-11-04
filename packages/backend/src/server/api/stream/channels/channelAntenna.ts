import type { NoteEntityService } from "@/core/entities/NoteEntityService.js";
import { bindThis } from "@/decorators.js";
import { DI } from "@/di-symbols.js";
import { isUserRelated } from "@/misc/is-user-related.js";
import type { Packed } from "@/misc/json-schema.js";
import type { Channel as _Channel } from "@/models/entities/Channel.js";
import type { ChannelsRepository } from "@/models/Repositories.js";
import { Inject, Injectable } from "@nestjs/common";
import Channel from "../channel.js";
import type { StreamMessages } from "../types.js";

class ChannelAntennaChannel extends Channel {
	public readonly chName = "channelAntenna";
	public static shouldShare = false;
	public static requireCredential = false as const;
	private channelId: string;
	private channel: _Channel | null;
	private antennaId: string | null;

	constructor(
		private noteEntityService: NoteEntityService,
		private channelsRepository: ChannelsRepository,

		id: string,
		connection: Channel["connection"],
	) {
		super(id, connection);
	}

	@bindThis
	public async init(params: any) {
		this.channelId = params.channelId as string;
		this.channel = await this.channelsRepository.findOne({
			where: {
				id: this.channelId,
			},
		});
		this.antennaId = this.channel?.antennaId ?? null;

		// Subscribe stream
		if (this.antennaId) {
			this.subscriber.on(`antennaStream:${this.antennaId}`, this.onEvent);
		}
	}

	@bindThis
	private async onEvent(data: StreamMessages["antenna"]["payload"]) {
		if (data.type === "note") {
			const note = await this.noteEntityService.pack(data.body.id, this.user, {
				detail: true,
			});

			// 収集はリモートのみ(トラブル防止の為)
			if (note.user.host === null) {
				return;
			}

			// 流れてきたNoteがミュートしているユーザーが関わるものだったら無視する
			if (isUserRelated(note, this.userIdsWhoMeMuting)) return;
			// 流れてきたNoteがブロックされているユーザーが関わるものだったら無視する
			if (isUserRelated(note, this.userIdsWhoBlockingMe)) return;

			if (
				note.renote &&
				!note.text &&
				isUserRelated(note, this.userIdsWhoMeMutingRenotes)
			)
				return;

			this.connection.cacheNote(note);

			this.send("note", note);
		} else {
			this.send(data.type, data.body);
		}
	}

	@bindThis
	public dispose() {
		// Unsubscribe events
		if (this.antennaId) {
			this.subscriber.off(`antennaStream:${this.antennaId}`, this.onEvent);
		}
	}
}

@Injectable()
export class ChannelAntennaChannelService {
	public readonly shouldShare = ChannelAntennaChannel.shouldShare;
	public readonly requireCredential = ChannelAntennaChannel.requireCredential;
	public readonly kind = ChannelAntennaChannel.kind;

	constructor(
		@Inject(DI.noteEntityService)
		private noteEntityService: NoteEntityService,

		@Inject(DI.channelsRepository)
		private channelsRepository: ChannelsRepository,
	) {}

	@bindThis
	public create(
		id: string,
		connection: Channel["connection"],
	): ChannelAntennaChannel {
		return new ChannelAntennaChannel(
			this.noteEntityService,
			this.channelsRepository,
			id,
			connection,
		);
	}
}
