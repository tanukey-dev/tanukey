import { $i, iAmModerator } from "@/account";
import { Router } from "@/nirax";
import MkError from "@/pages/_error_.vue";
import MkLoading from "@/pages/_loading_.vue";
import type { AsyncComponentLoader } from "vue";
import { defineAsyncComponent, inject } from "vue";
import { miLocalStorage } from "./local-storage";

function getCurrentUi() {
	return miLocalStorage.getItem("ui");
}

const page = (loader: AsyncComponentLoader<any>) =>
	defineAsyncComponent({
		loader: loader,
		loadingComponent: MkLoading,
		errorComponent: MkError,
	});

export const routes = [
	// public
	{
		path: "/instance-info/:host",
		component: page(() => import("./pages/instance-info.vue")),
	},
	{
		path: "/reset-password/:token?",
		component: page(() => import("./pages/reset-password.vue")),
	},
	{
		path: "/signup-complete/:code",
		component: page(() => import("./pages/signup-complete.vue")),
	},
	{
		path: "/auth/:token",
		component: page(() => import("./pages/auth.vue")),
	},
	{
		path: "/miauth/:session",
		component: page(() => import("./pages/miauth.vue")),
		query: {
			callback: "callback",
			name: "name",
			icon: "icon",
			permission: "permission",
		},
	},
	{
		path: "/@:initUser/pages/:initPageName/view-source",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/page-editor/page-editor.vue")),
	},
	{
		path: "/@:username/pages/:pageName",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/page.vue")),
	},
	{
		path: "/@:acct/following",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/user/following.vue")),
	},
	{
		path: "/@:acct/followers",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/user/followers.vue")),
	},
	{
		path: "/@:acct/:page?",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/user/index.vue")),
	},
	{
		path: "/notes/:noteId",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/note.vue")),
	},
	{
		path: "/list/:listId",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/list.vue")),
	},
	{
		path: "/clips/:clipId",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/clip.vue")),
	},
	{
		path: "/play/:id",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/flash/flash.vue")),
	},
	{
		path: "/gallery/:postId",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/gallery/post.vue")),
	},
	{
		path: "/channels",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/channels.vue")),
	},
	{
		path: "/channels/:channelId",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/channel.vue")),
	},
	{
		path: "/events",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/events.vue")),
	},
	{
		path: "/events/:eventId",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/event.vue")),
	},
	{
		path: "/events/:eventId/:eventCircleId",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/event-circle.vue")),
	},
	{
		path: "/circles",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/circles.vue")),
	},
	{
		path: "/circles/:circleId",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/circle.vue")),
	},
	{
		path: "/tags/:tag",
		redirect: (path: string) => ($i ? `/secure${path}` : undefined),
		component: page(() => import("./pages/tag.vue")),
	},
	// need login
	{
		path: "/secure",
		component: page(() => import("./pages/secure.vue")),
		loginRequired: true,
		children: [
			{
				path: "/user-info/:userId",
				component: page(() => import("./pages/user-info.vue")),
				hash: "initialTab",
			},
			{
				path: "/@:initUser/pages/:initPageName/view-source",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/page-editor/page-editor.vue")),
			},
			{
				path: "/@:username/pages/:pageName",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/page.vue")),
			},
			{
				path: "/@:acct/following",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/user/following.vue")),
			},
			{
				path: "/@:acct/followers",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/user/followers.vue")),
			},
			{
				path: "/@:acct/:page?",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/user/index.vue")),
			},
			{
				path: "/notes/:noteId",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/note.vue")),
			},
			{
				path: "/list/:listId",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/list.vue")),
			},
			{
				path: "/clips/:clipId",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/clip.vue")),
			},
			{
				path: "/announcements",
				component: page(() => import("./pages/announcements.vue")),
			},
			{
				path: "/about",
				component: page(() => import("./pages/about.vue")),
				hash: "initialTab",
			},
			{
				path: "/about-tanukey",
				component: page(() => import("./pages/about-tanukey.vue")),
			},
			{
				path: "/invite",
				name: "invite",
				component: page(() => import("./pages/invite.vue")),
			},
			{
				path: "/ads",
				component: page(() => import("./pages/ads.vue")),
			},
			{
				path: "/theme-editor",
				component: page(() => import("./pages/theme-editor.vue")),
			},
			{
				path: "/roles/:role",
				component: page(() => import("./pages/role.vue")),
			},
			{
				path: "/user-tags/:tag",
				component: page(() => import("./pages/user-tag.vue")),
			},
			{
				path: "/explore",
				component: page(() => import("./pages/explore.vue")),
				hash: "initialTab",
			},
			{
				path: "/search",
				component: page(() => import("./pages/search.vue")),
				query: {
					q: "query",
					origin: "origin",
				},
			},
			{
				path: "/authorize-follow",
				component: page(() => import("./pages/follow.vue")),
			},
			{
				path: "/share",
				component: page(() => import("./pages/share.vue")),
			},
			{
				path: "/api-console",
				component: page(() => import("./pages/api-console.vue")),
			},
			{
				path: "/scratchpad",
				component: page(() => import("./pages/scratchpad.vue")),
			},
			{
				path: "/tags/:tag",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/tag.vue")),
			},
			{
				path: "/pages/new",
				component: page(() => import("./pages/page-editor/page-editor.vue")),
			},
			{
				path: "/pages/edit/:initPageId",
				component: page(() => import("./pages/page-editor/page-editor.vue")),
			},
			{
				path: "/pages",
				component: page(() => import("./pages/pages.vue")),
			},
			{
				path: "/play/:id/edit",
				component: page(() => import("./pages/flash/flash-edit.vue")),
			},
			{
				path: "/play/new",
				component: page(() => import("./pages/flash/flash-edit.vue")),
			},
			{
				path: "/play/:id",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/flash/flash.vue")),
			},
			{
				path: "/play",
				component: page(() => import("./pages/flash/flash-index.vue")),
			},
			{
				path: "/gallery/:postId/edit",
				component: page(() => import("./pages/gallery/edit.vue")),
			},
			{
				path: "/gallery/new",
				component: page(() => import("./pages/gallery/edit.vue")),
			},
			{
				path: "/gallery/:postId",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/gallery/post.vue")),
			},
			{
				path: "/gallery",
				component: page(() => import("./pages/gallery/index.vue")),
			},
			{
				path: "/channels/:channelId/edit",
				component: page(() => import("./pages/channel-editor.vue")),
			},
			{
				path: "/channels/new",
				component: page(() => import("./pages/channel-editor.vue")),
			},
			{
				path: "/channels",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/channels.vue")),
			},
			{
				path: "/channels/:channelId",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/channel.vue")),
			},
			{
				path: "/events",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/events.vue")),
			},
			{
				path: "/events/new",
				component: page(() => import("./pages/event-editor.vue")),
			},
			{
				path: "/events/:eventId/join",
				component: page(() => import("./pages/event-circle-editor.vue")),
			},
			{
				path: "/events/:eventId/edit",
				component: page(() => import("./pages/event-editor.vue")),
			},
			{
				path: "/events/:eventId/:eventCircleId/edit",
				component: page(() => import("./pages/event-circle-editor.vue")),
			},
			{
				path: "/events/:eventId",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/event.vue")),
			},
			{
				path: "/events/:eventId/:eventCircleId",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/event-circle.vue")),
			},
			{
				path: "/circles",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/circles.vue")),
			},
			{
				path: "/circles/:circleId",
				redirect: (path: string) =>
					$i ? undefined : path.slice("/secure".length),
				component: page(() => import("./pages/circle.vue")),
			},
			{
				path: "/circles/:circleId/edit",
				component: page(() => import("./pages/circle-editor.vue")),
			},
			{
				path: "/circles/new",
				component: page(() => import("./pages/circle-editor.vue")),
			},
			{
				path: "/custom-emojis-manager",
				component: page(() => import("./pages/custom-emojis-manager.vue")),
			},
			{
				path: "/registry/keys/system/:path(*)?",
				component: page(() => import("./pages/registry.keys.vue")),
			},
			{
				path: "/registry/value/system/:path(*)?",
				component: page(() => import("./pages/registry.value.vue")),
			},
			{
				path: "/registry",
				component: page(() => import("./pages/registry.vue")),
			},
			{
				path: "/my/notifications",
				component: page(() => import("./pages/notifications.vue")),
			},
			{
				path: "/my/favorites",
				component: page(() => import("./pages/favorites.vue")),
			},
			{
				path: "/my/achievements",
				component: page(() => import("./pages/achievements.vue")),
			},
			{
				path: "/my/drive/folder/:folder",
				component: page(() => import("./pages/drive.vue")),
			},
			{
				path: "/my/drive",
				component: page(() => import("./pages/drive.vue")),
			},
			{
				path: "/my/follow-requests",
				component: page(() => import("./pages/follow-requests.vue")),
			},
			{
				path: "/my/lists/:listId",
				component: page(() => import("./pages/my-lists/list.vue")),
			},
			{
				path: "/my/lists",
				component: page(() => import("./pages/my-lists/index.vue")),
			},
			{
				path: "/my/clips",
				component: page(() => import("./pages/my-clips/index.vue")),
			},
			{
				path: "/my/antennas/create",
				component: page(() => import("./pages/my-antennas/create.vue")),
			},
			{
				path: "/my/antennas/:antennaId",
				component: page(() => import("./pages/my-antennas/edit.vue")),
			},
			{
				path: "/my/antennas",
				component: page(() => import("./pages/my-antennas/index.vue")),
			},
			{
				path: "/timeline/list/:listId",
				component: page(() => import("./pages/user-list-timeline.vue")),
			},
			{
				path: "/timeline/antenna/:antennaId",
				component: page(() => import("./pages/antenna-timeline.vue")),
			},
			{
				path: "/timeline",
				component: page(() => import("./pages/timeline.vue")),
			},
			{
				path: "/settings",
				component: page(() => import("./pages/settings/index.vue")),
				children: [
					{
						path: "/profile",
						component: page(() => import("./pages/settings/profile.vue")),
					},
					{
						path: "/roles",
						component: page(() => import("./pages/settings/roles.vue")),
					},
					{
						path: "/privacy",
						component: page(() => import("./pages/settings/privacy.vue")),
					},
					{
						path: "/reaction",
						component: page(() => import("./pages/settings/reaction.vue")),
					},
					{
						path: "/drive",
						component: page(() => import("./pages/settings/drive.vue")),
					},
					{
						path: "/drive/cleaner",
						component: page(() => import("./pages/settings/drive-cleaner.vue")),
					},
					{
						path: "/notifications",
						component: page(() => import("./pages/settings/notifications.vue")),
					},
					{
						path: "/email",
						component: page(() => import("./pages/settings/email.vue")),
					},
					{
						path: "/security",
						component: page(() => import("./pages/settings/security.vue")),
					},
					{
						path: "/general",
						component: page(() => import("./pages/settings/general.vue")),
					},
					{
						path: "/feedSettings",
						component: page(() => import("./pages/settings/feedSettings.vue")),
					},
					{
						path: "/theme/install",
						component: page(() => import("./pages/settings/theme.install.vue")),
					},
					{
						path: "/theme/manage",
						component: page(() => import("./pages/settings/theme.manage.vue")),
					},
					{
						path: "/theme",
						component: page(() => import("./pages/settings/theme.vue")),
					},
					{
						path: "/navbar",
						component: page(() => import("./pages/settings/navbar.vue")),
					},
					{
						path: "/statusbar",
						component: page(() => import("./pages/settings/statusbar.vue")),
					},
					{
						path: "/sounds",
						component: page(() => import("./pages/settings/sounds.vue")),
					},
					{
						path: "/plugin/install",
						component: page(
							() => import("./pages/settings/plugin.install.vue"),
						),
					},
					{
						path: "/plugin",
						component: page(() => import("./pages/settings/plugin.vue")),
					},
					{
						path: "/import-export",
						component: page(() => import("./pages/settings/import-export.vue")),
					},
					{
						path: "/instance-mute",
						component: page(() => import("./pages/settings/instance-mute.vue")),
					},
					{
						path: "/mute-block",
						component: page(() => import("./pages/settings/mute-block.vue")),
					},
					{
						path: "/word-mute",
						component: page(() => import("./pages/settings/word-mute.vue")),
					},
					{
						path: "/api",
						component: page(() => import("./pages/settings/api.vue")),
					},
					{
						path: "/apps",
						component: page(() => import("./pages/settings/apps.vue")),
					},
					{
						path: "/webhook/edit/:webhookId",
						component: page(() => import("./pages/settings/webhook.edit.vue")),
					},
					{
						path: "/webhook/new",
						component: page(() => import("./pages/settings/webhook.new.vue")),
					},
					{
						path: "/webhook",
						component: page(() => import("./pages/settings/webhook.vue")),
					},
					{
						path: "/deck",
						component: page(() => import("./pages/settings/deck.vue")),
					},
					{
						path: "/preferences-backups",
						component: page(
							() => import("./pages/settings/preferences-backups.vue"),
						),
					},
					{
						path: "/migration",
						component: page(() => import("./pages/settings/migration.vue")),
					},
					{
						path: "/custom-css",
						component: page(() => import("./pages/settings/custom-css.vue")),
					},
					{
						path: "/accounts",
						component: page(() => import("./pages/settings/accounts.vue")),
					},
					{
						path: "/subscription",
						component: page(() => import("./pages/settings/subscription.vue")),
					},
					{
						path: "/points",
						component: page(() => import("./pages/settings/points.vue")),
					},
					{
						path: "/other",
						component: page(() => import("./pages/settings/other.vue")),
					},
					{
						path: "/",
						component: page(() => import("./pages/_empty_.vue")),
					},
				],
			},
			{
				path: "/admin",
				component: iAmModerator
					? page(() => import("./pages/admin/index.vue"))
					: page(() => import("./pages/not-found.vue")),
				children: [
					{
						path: "/overview",
						name: "overview",
						component: page(() => import("./pages/admin/overview.vue")),
					},
					{
						path: "/users",
						name: "users",
						component: page(() => import("./pages/admin/users.vue")),
					},
					{
						path: "/emojis",
						name: "emojis",
						component: page(() => import("./pages/custom-emojis-manager.vue")),
					},
					{
						path: "/queue",
						name: "queue",
						component: page(() => import("./pages/admin/queue.vue")),
					},
					{
						path: "/files",
						name: "files",
						component: page(() => import("./pages/admin/files.vue")),
					},
					{
						path: "/file/:fileId",
						component: page(() => import("./pages/admin-file.vue")),
					},
					{
						path: "/federation",
						name: "federation",
						component: page(() => import("./pages/admin/federation.vue")),
					},
					{
						path: "/announcements",
						name: "announcements",
						component: page(() => import("./pages/admin/announcements.vue")),
					},
					{
						path: "/ads",
						name: "ads",
						component: page(() => import("./pages/admin/ads.vue")),
					},
					{
						path: "/roles/:id/edit",
						name: "roles",
						component: page(() => import("./pages/admin/roles.edit.vue")),
					},
					{
						path: "/roles/new",
						name: "roles",
						component: page(() => import("./pages/admin/roles.edit.vue")),
					},
					{
						path: "/roles/:id",
						name: "roles",
						component: page(() => import("./pages/admin/roles.role.vue")),
					},
					{
						path: "/roles",
						name: "roles",
						component: page(() => import("./pages/admin/roles.vue")),
					},
					{
						path: "/subscription-plans",
						name: "subscription-plans",
						component: page(
							() => import("@/pages/admin/subscription-plans.vue"),
						),
					},
					{
						path: "/database",
						name: "database",
						component: page(() => import("./pages/admin/database.vue")),
					},
					{
						path: "/abuses",
						name: "abuses",
						component: page(() => import("./pages/admin/abuses.vue")),
					},
					{
						path: "/settings",
						name: "settings",
						component: page(() => import("./pages/admin/settings.vue")),
					},
					{
						path: "/pinnedChannel",
						name: "pinnedChannel",
						component: page(() => import("./pages/admin/pinnedChannel.vue")),
					},
					{
						path: "/branding",
						name: "branding",
						component: page(() => import("./pages/admin/branding.vue")),
					},
					{
						path: "/moderation",
						name: "moderation",
						component: page(() => import("./pages/admin/moderation.vue")),
					},
					{
						path: "/email-settings",
						name: "email-settings",
						component: page(() => import("./pages/admin/email-settings.vue")),
					},
					{
						path: "/object-storage",
						name: "object-storage",
						component: page(() => import("./pages/admin/object-storage.vue")),
					},
					{
						path: "/security",
						name: "security",
						component: page(() => import("./pages/admin/security.vue")),
					},
					{
						path: "/relays",
						name: "relays",
						component: page(() => import("./pages/admin/relays.vue")),
					},
					{
						path: "/instance-block",
						name: "instance-block",
						component: page(() => import("./pages/admin/instance-block.vue")),
					},
					{
						path: "/proxy-account",
						name: "proxy-account",
						component: page(() => import("./pages/admin/proxy-account.vue")),
					},
					{
						path: "/other-settings",
						name: "other-settings",
						component: page(() => import("./pages/admin/other-settings.vue")),
					},
					{
						path: "/server-rules",
						name: "server-rules",
						component: page(() => import("./pages/admin/server-rules.vue")),
					},
					{
						path: "/invites",
						name: "invites",
						component: page(() => import("./pages/admin/invites.vue")),
					},
					{
						path: "/",
						component: page(() => import("./pages/_empty_.vue")),
					},
				],
			},
		],
	},
	{
		name: "index",
		path: "/",
		redirect: (): string | undefined => {
			return $i
				? getCurrentUi() === "deck"
					? "/secure"
					: "/secure/timeline"
				: undefined;
		},
		component: page(() => import("./pages/welcome.vue")),
		globalCacheKey: "index",
	},
	{
		path: "/:(*)",
		component: page(() => import("./pages/not-found.vue")),
	},
];

export const mainRouter = new Router(
	routes,
	location.pathname + location.search + location.hash,
);

window.history.replaceState(
	{ key: mainRouter.getCurrentKey() },
	"",
	location.href,
);

mainRouter.addListener("push", (ctx) => {
	window.history.pushState({ key: ctx.key }, "", ctx.path);
});

window.addEventListener("popstate", (event) => {
	mainRouter.replace(
		location.pathname + location.search + location.hash,
		event.state?.key,
	);
});

export function useRouter(): Router {
	return inject<Router | null>("router", null) ?? mainRouter;
}
