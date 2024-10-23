import { randomUUID } from "node:crypto";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Inject, Injectable } from "@nestjs/common";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter.js";
import { FastifyAdapter } from "@bull-board/fastify";
import ms from "ms";
import sharp from "sharp";
import pug from "pug";
import { In, IsNull } from "typeorm";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import fastifyCookie from "@fastify/cookie";
import fastifyProxy from "@fastify/http-proxy";
import vary from "vary";
import type { Config } from "@/config.js";
import { getNoteSummary } from "@/misc/get-note-summary.js";
import { DI } from "@/di-symbols.js";
import * as Acct from "@/misc/acct.js";
import { MetaService } from "@/core/MetaService.js";
import type {
	DbQueue,
	DeliverQueue,
	EndedPollNotificationQueue,
	InboxQueue,
	ObjectStorageQueue,
	SystemQueue,
	WebhookDeliverQueue,
} from "@/core/QueueModule.js";
import { UserEntityService } from "@/core/entities/UserEntityService.js";
import { NoteEntityService } from "@/core/entities/NoteEntityService.js";
import { PageEntityService } from "@/core/entities/PageEntityService.js";
import { GalleryPostEntityService } from "@/core/entities/GalleryPostEntityService.js";
import { ClipEntityService } from "@/core/entities/ClipEntityService.js";
import { ChannelEntityService } from "@/core/entities/ChannelEntityService.js";
import type {
	ChannelsRepository,
	ClipsRepository,
	FlashsRepository,
	GalleryPostsRepository,
	Meta,
	NotesRepository,
	PagesRepository,
	UserProfilesRepository,
	UsersRepository,
} from "@/models/index.js";
import type Logger from "@/logger.js";
import { deepClone } from "@/misc/clone.js";
import { bindThis } from "@/decorators.js";
import { FlashEntityService } from "@/core/entities/FlashEntityService.js";
import { RoleService } from "@/core/RoleService.js";
import manifest from "./manifest.json" assert { type: "json" };
import { FeedService } from "./FeedService.js";
import { UrlPreviewService } from "./UrlPreviewService.js";
import { ClientLoggerService } from "./ClientLoggerService.js";
import type {
	FastifyInstance,
	FastifyPluginOptions,
	FastifyReply,
} from "fastify";
import Parameters from "typescript";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const staticAssets = `${_dirname}/../../../assets/`;
const clientAssets = `${_dirname}/../../../../frontend/assets/`;
const assets = `${_dirname}/../../../../../built/_frontend_dist_/`;
const swAssets = `${_dirname}/../../../../../built/_sw_dist_/`;
const viteOut = `${_dirname}/../../../../../built/_vite_/`;

@Injectable()
export class ClientServerService {
	private logger: Logger;

	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		@Inject(DI.userProfilesRepository)
		private userProfilesRepository: UserProfilesRepository,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		@Inject(DI.galleryPostsRepository)
		private galleryPostsRepository: GalleryPostsRepository,

		@Inject(DI.channelsRepository)
		private channelsRepository: ChannelsRepository,

		@Inject(DI.clipsRepository)
		private clipsRepository: ClipsRepository,

		@Inject(DI.pagesRepository)
		private pagesRepository: PagesRepository,

		@Inject(DI.flashsRepository)
		private flashsRepository: FlashsRepository,

		private flashEntityService: FlashEntityService,
		private userEntityService: UserEntityService,
		private noteEntityService: NoteEntityService,
		private pageEntityService: PageEntityService,
		private galleryPostEntityService: GalleryPostEntityService,
		private clipEntityService: ClipEntityService,
		private channelEntityService: ChannelEntityService,
		private metaService: MetaService,
		private urlPreviewService: UrlPreviewService,
		private feedService: FeedService,
		private roleService: RoleService,
		private clientLoggerService: ClientLoggerService,

		@Inject("queue:system") public systemQueue: SystemQueue,
		@Inject("queue:endedPollNotification")
		public endedPollNotificationQueue: EndedPollNotificationQueue,
		@Inject("queue:deliver") public deliverQueue: DeliverQueue,
		@Inject("queue:inbox") public inboxQueue: InboxQueue,
		@Inject("queue:db") public dbQueue: DbQueue,
		@Inject("queue:objectStorage")
		public objectStorageQueue: ObjectStorageQueue,
		@Inject("queue:webhookDeliver")
		public webhookDeliverQueue: WebhookDeliverQueue,
	) {
		//this.createServer = this.createServer.bind(this);
	}

	@bindThis
	private async manifestHandler(reply: FastifyReply) {
		const res = deepClone(manifest);

		const instance = await this.metaService.fetch(true);

		res.short_name = instance.name ?? "Tanukey";
		res.name = instance.name ?? "Tanukey";
		if (instance.themeColor) res.theme_color = instance.themeColor;

		reply.header("Cache-Control", "max-age=300");
		return res;
	}

	@bindThis
	private generateCommonPugData(meta: Meta) {
		return {
			instanceName: meta.name ?? "Tanukey",
			icon: meta.iconUrl,
			themeColor: meta.themeColor,
			serverErrorImageUrl:
				meta.serverErrorImageUrl ?? "https://xn--931a.moe/assets/error.jpg",
			infoImageUrl: meta.infoImageUrl ?? "https://xn--931a.moe/assets/info.jpg",
			notFoundImageUrl:
				meta.notFoundImageUrl ?? "https://xn--931a.moe/assets/not-found.jpg",
			siteGtagGoogleAnalytics: this.config.siteGtagGoogleAnalytics,
			siteGtagGoogleAds: this.config.siteGtagGoogleAds,
			siteGtagGoogleAdsConversion: this.config.siteGtagGoogleAdsConversion,
		};
	}

	@bindThis
	public createServer(
		fastify: FastifyInstance,
		options: FastifyPluginOptions,
		done: (err?: Error) => void,
	) {
		fastify.register(fastifyCookie, {});

		//#region Bull Dashboard
		const bullBoardPath = "/queue";

		// Authenticate
		fastify.addHook("onRequest", async (request, reply) => {
			if (
				request.url === bullBoardPath ||
				request.url.startsWith(`${bullBoardPath}/`)
			) {
				const token = request.cookies.token;
				if (token == null) {
					reply.code(401);
					throw new Error("login required");
				}
				const user = await this.usersRepository.findOneBy({ token });
				if (user == null) {
					reply.code(403);
					throw new Error("no such user");
				}
				const isAdministrator = await this.roleService.isAdministrator(user);
				if (!isAdministrator) {
					reply.code(403);
					throw new Error("access denied");
				}
			}
		});

		const serverAdapter = new FastifyAdapter();

		createBullBoard({
			queues: [
				this.systemQueue,
				this.endedPollNotificationQueue,
				this.deliverQueue,
				this.inboxQueue,
				this.dbQueue,
				this.objectStorageQueue,
				this.webhookDeliverQueue,
			].map((q) => new BullAdapter(q)),
			serverAdapter,
		});

		serverAdapter.setBasePath(bullBoardPath);
		(fastify.register as any)(serverAdapter.registerPlugin(), {
			prefix: bullBoardPath,
		});
		//#endregion

		fastify.register(fastifyView, {
			root: `${_dirname}/views`,
			engine: {
				pug: pug,
			},
			defaultContext: {
				version: this.config.version,
				config: this.config,
			},
		});

		fastify.addHook("onRequest", (request, reply, done) => {
			// クリックジャッキング防止のためiFrameの中に入れられないようにする
			reply.header("X-Frame-Options", "DENY");
			done();
		});

		//#region static assets

		fastify.register(fastifyStatic, {
			root: staticAssets,
			prefix: "/static-assets/",
			maxAge: ms("7 days"),
			decorateReply: false,
		});

		fastify.register(fastifyStatic, {
			root: clientAssets,
			prefix: "/client-assets/",
			maxAge: ms("7 days"),
			decorateReply: false,
		});

		fastify.register(fastifyStatic, {
			root: assets,
			prefix: "/assets/",
			maxAge: ms("7 days"),
			decorateReply: false,
		});

		fastify.get("/favicon.ico", async (request, reply) => {
			return reply.sendFile("/favicon.ico", staticAssets);
		});

		fastify.get("/apple-touch-icon.png", async (request, reply) => {
			return reply.sendFile("/apple-touch-icon.png", staticAssets);
		});

		fastify.get<{ Params: { path: string } }>(
			"/fluent-emoji/:path(.*)",
			async (request, reply) => {
				const path = request.params.path;

				if (!path.match(/^[0-9a-f-]+\.png$/)) {
					reply.code(404);
					return;
				}

				reply.header(
					"Content-Security-Policy",
					"default-src 'none'; style-src 'unsafe-inline'",
				);

				return await reply.sendFile(
					path,
					`${_dirname}/../../../../../fluent-emojis/dist/`,
					{
						maxAge: ms("30 days"),
					},
				);
			},
		);

		fastify.get<{ Params: { path: string } }>(
			"/twemoji/:path(.*)",
			async (request, reply) => {
				const path = request.params.path;

				if (!path.match(/^[0-9a-f-]+\.svg$/)) {
					reply.code(404);
					return;
				}

				reply.header(
					"Content-Security-Policy",
					"default-src 'none'; style-src 'unsafe-inline'",
				);

				return await reply.sendFile(
					path,
					`${_dirname}/../../../node_modules/@discordapp/twemoji/dist/svg/`,
					{
						maxAge: ms("30 days"),
					},
				);
			},
		);

		fastify.get<{ Params: { path: string } }>(
			"/twemoji-badge/:path(.*)",
			async (request, reply) => {
				const path = request.params.path;

				if (!path.match(/^[0-9a-f-]+\.png$/)) {
					reply.code(404);
					return;
				}

				const mask = await sharp(
					`${_dirname}/../../../node_modules/@discordapp/twemoji/dist/svg/${path.replace(".png", "")}.svg`,
					{ density: 1000 },
				)
					.resize(488, 488)
					.greyscale()
					.normalise()
					.linear(1.75, -(128 * 1.75) + 128) // 1.75x contrast
					.flatten({ background: "#000" })
					.extend({
						top: 12,
						bottom: 12,
						left: 12,
						right: 12,
						background: "#000",
					})
					.toColorspace("b-w")
					.png()
					.toBuffer();

				const buffer = await sharp({
					create: {
						width: 512,
						height: 512,
						channels: 4,
						background: { r: 0, g: 0, b: 0, alpha: 0 },
					},
				})
					.pipelineColorspace("b-w")
					.boolean(mask, "eor")
					.resize(96, 96)
					.png()
					.toBuffer();

				reply.header(
					"Content-Security-Policy",
					"default-src 'none'; style-src 'unsafe-inline'",
				);
				reply.header("Cache-Control", "max-age=2592000");
				reply.header("Content-Type", "image/png");
				return buffer;
			},
		);

		// ServiceWorker
		fastify.get("/sw.js", async (request, reply) => {
			return await reply.sendFile("/sw.js", swAssets, {
				maxAge: ms("10 minutes"),
			});
		});

		// Manifest
		fastify.get(
			"/manifest.json",
			async (request, reply) => await this.manifestHandler(reply),
		);

		fastify.get("/robots.txt", async (request, reply) => {
			return await reply.sendFile("/robots.txt", staticAssets);
		});

		// OpenSearch XML
		fastify.get("/opensearch.xml", async (request, reply) => {
			const meta = await this.metaService.fetch();

			const name = meta.name ?? "Tanukey";
			let content = "";
			content +=
				'<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">';
			content += `<ShortName>${name}</ShortName>`;
			content += `<Description>${name} Search</Description>`;
			content += "<InputEncoding>UTF-8</InputEncoding>";
			content += `<Image width="16" height="16" type="image/x-icon">${this.config.url}/favicon.ico</Image>`;
			content += `<Url type="text/html" template="${this.config.url}/search?q={searchTerms}"/>`;
			content += "</OpenSearchDescription>";

			reply.header("Content-Type", "application/opensearchdescription+xml");
			return await reply.send(content);
		});

		//#endregion

		// URL preview endpoint
		fastify.get<{ Querystring: { url: string; lang: string } }>(
			"/url",
			(request, reply) => this.urlPreviewService.handle(request, reply),
		);

		// streamingに非WebSocketリクエストが来た場合にbase htmlをキャシュ付きで返すと、Proxy等でそのパスがキャッシュされておかしくなる
		fastify.get("/streaming", async (request, reply) => {
			reply.code(503);
			reply.header("Cache-Control", "private, max-age=0");
		});

		fastify.setErrorHandler(async (error, request, reply) => {
			const errId = randomUUID();
			this.clientLoggerService.logger.error(
				`Internal error occured in ${request.routerPath}: ${error.message}`,
				{
					path: request.routerPath,
					params: request.params,
					query: request.query,
					code: error.name,
					stack: error.stack,
					id: errId,
				},
			);
			reply.code(500);
			reply.header("Cache-Control", "max-age=10, must-revalidate");
			return await reply.view("error", {
				code: error.code,
				id: errId,
			});
		});

		done();
	}
}
