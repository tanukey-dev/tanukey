import { Inject, Injectable } from "@nestjs/common";
import { summaly } from "@misskey-dev/summaly";
import type { SummalyResult } from "@misskey-dev/summaly/built/summary.js";
import { DI } from "@/di-symbols.js";
import type { Config } from "@/config.js";
import type { MetaService } from "@/core/MetaService.js";
import type { HttpRequestService } from "@/core/HttpRequestService.js";
import type Logger from "@/logger.js";
import { query } from "@/misc/prelude/url.js";
import type { LoggerService } from "@/core/LoggerService.js";
import { bindThis } from "@/decorators.js";
import { ApiError } from "@/server/api/error.js";
import type { Meta } from "@/models/entities/Meta";
import type { FastifyRequest, FastifyReply } from "fastify";

@Injectable()
export class UrlPreviewService {
	private logger: Logger;

	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.metaService)
		private metaService: MetaService,

		@Inject(DI.httpRequestService)
		private httpRequestService: HttpRequestService,

		@Inject(DI.loggerService)
		private loggerService: LoggerService,
	) {
		this.logger = this.loggerService.getLogger("url-preview");
	}

	@bindThis
	private wrap(url?: string | null): string | null {
		return url != null
			? url.match(/^https?:\/\//)
				? `${this.config.mediaProxy}/preview.webp?${query({
						url,
						preview: "1",
					})}`
				: url
			: null;
	}

	@bindThis
	public async handle(
		request: FastifyRequest<{ Querystring: { url: string; lang?: string } }>,
		reply: FastifyReply,
	): Promise<object | undefined> {
		const url = request.query.url;
		if (typeof url !== "string") {
			reply.code(400);
			return;
		}

		const lang = request.query.lang;
		if (Array.isArray(lang)) {
			reply.code(400);
			return;
		}

		const meta = await this.metaService.fetch();

		try {
			const summary = await this.fetchSummary(url, meta, lang);

			this.logger.succ(`Got preview of ${url}: ${summary.title}`);

			if (
				!(
					summary.url.startsWith("http://") ||
					summary.url.startsWith("https://")
				)
			) {
				throw new Error("unsupported schema included");
			}

			if (
				summary.player.url &&
				!(
					summary.player.url.startsWith("http://") ||
					summary.player.url.startsWith("https://")
				)
			) {
				throw new Error("unsupported schema included");
			}

			summary.icon = this.wrap(summary.icon);
			summary.thumbnail = this.wrap(summary.thumbnail);

			// Cache 7days
			reply.header("Cache-Control", "max-age=604800, immutable");

			return summary;
		} catch (err) {
			this.logger.warn(`Failed to get preview of ${url}: ${err}`);

			reply.code(422);
			reply.header("Cache-Control", "max-age=86400, immutable");
			return {
				error: new ApiError({
					message: "Failed to get preview",
					code: "URL_PREVIEW_FAILED",
					id: "09d01cb5-53b9-4856-82e5-38a50c290a3b",
				}),
			};
		}
	}

	private fetchSummary(
		url: string,
		meta: Meta,
		lang?: string,
	): Promise<SummalyResult> {
		const agent = this.config.proxy
			? {
					http: this.httpRequestService.httpAgent,
					https: this.httpRequestService.httpsAgent,
				}
			: undefined;

		return summaly(url, {
			followRedirects: false,
			lang: lang ?? "ja-JP",
			agent: agent,
		});
	}
}
