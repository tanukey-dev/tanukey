import { Injectable } from "@nestjs/common";
import { Endpoint } from "@/server/api/endpoint-base.js";
import { QueueService } from "@/core/QueueService.js";

export const meta = {
	secure: true,
	requireCredential: true,
	requireRolePolicy: "canManageCustomEmojis",
} as const;

export const paramDef = {
	type: "object",
	properties: {
		fileId: { type: "string", format: "misskey:id" },
	},
	required: ["fileId"],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(private queueService: QueueService) {
		super(meta, paramDef, async (ps, me) => {
			this.queueService.createImportCustomEmojisJob(me, ps.fileId);
		});
	}
}
