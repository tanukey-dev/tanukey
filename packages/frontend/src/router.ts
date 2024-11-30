import { $i, iAmModerator } from "@/account";
import MkError from "@/pages/_error_.vue";
import MkLoading from "@/pages/_loading_.vue";
import type { AsyncComponentLoader } from "vue";
import { defineAsyncComponent } from "vue";
import { createWebHistory, createRouter } from "vue-router";
import { uiMode } from "@/config";

const page = (loader: AsyncComponentLoader<any>) =>
	defineAsyncComponent({
		loader: loader,
		loadingComponent: MkLoading,
		errorComponent: MkError,
	});

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		// public
		{
			path: "/timeline",
			component: page(() => import("./pages/timeline-public.vue")),
		},
		{
			path: "/@:username/pages/:pageName",
			component: page(() => import("./pages/page.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/@:acct/following",
			component: page(() => import("./pages/user/following.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/@:acct/followers",
			component: page(() => import("./pages/user/followers.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/@:acct/:page?",
			component: page(() => import("./pages/user/index.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/notes/:noteId",
			component: page(() => import("./pages/note.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/pages",
			component: page(() => import("./pages/pages.vue")),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/list/:listId",
			component: page(() => import("./pages/list.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/clips/:clipId",
			component: page(() => import("./pages/clip.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/play/:id",
			component: page(() => import("./pages/flash/flash.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/gallery/:postId",
			component: page(() => import("./pages/gallery/post.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/channels",
			component: page(() => import("./pages/channels.vue")),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/channels/:channelId",
			component: page(() => import("./pages/channel.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/tags/:tag",
			component: page(() => import("./pages/tag.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				loginedUserRedirect: true,
			},
		},
		// need login
		{
			path: "/share",
			component: page(() => import("./pages/share.vue")),
			meta: {
				needLogin: true,
				zen: true,
			},
		},
		// need login
		{
			path: "/secure",
			children: [
				{
					path: "timeline",
					component: page(() => import("./pages/timeline.vue")),
				},
				{
					path: "deck",
					component: page(() => import("./ui/deck.vue")),
				},
				{
					path: "user-info/:userId",
					component: page(() => import("./pages/user-info.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "@:username/pages/:pageName",
					component: page(() => import("./pages/page.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "@:acct/following",
					component: page(() => import("./pages/user/following.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "@:acct/followers",
					component: page(() => import("./pages/user/followers.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "@:acct/:page?",
					component: page(() => import("./pages/user/index.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "notes/:noteId",
					component: page(() => import("./pages/note.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "list/:listId",
					component: page(() => import("./pages/list.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "clips/:clipId",
					component: page(() => import("./pages/clip.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "announcements",
					component: page(() => import("./pages/announcements.vue")),
				},
				{
					path: "about",
					component: page(() => import("./pages/about.vue")),
				},
				{
					path: "about-tanukey",
					component: page(() => import("./pages/about-tanukey.vue")),
				},
				{
					path: "theme-editor",
					component: page(() => import("./pages/theme-editor.vue")),
				},
				{
					path: "roles/:role",
					component: page(() => import("./pages/role.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "user-tags/:tag",
					component: page(() => import("./pages/user-tag.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "search",
					component: page(() => import("./pages/search.vue")),
				},
				{
					path: "authorize-follow",
					component: page(() => import("./pages/follow.vue")),
				},
				{
					path: "tags/:tag",
					component: page(() => import("./pages/tag.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "pages/new",
					component: page(() => import("./pages/page-editor/page-editor.vue")),
				},
				{
					path: "pages/edit/:initPageId",
					component: page(() => import("./pages/page-editor/page-editor.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "pages",
					component: page(() => import("./pages/pages.vue")),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "play/:id/edit",
					component: page(() => import("./pages/flash/flash-edit.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "play/new",
					component: page(() => import("./pages/flash/flash-edit.vue")),
				},
				{
					path: "play/:id",
					component: page(() => import("./pages/flash/flash.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "play",
					component: page(() => import("./pages/flash/flash-index.vue")),
				},
				{
					path: "gallery/:postId/edit",
					component: page(() => import("./pages/gallery/edit.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "gallery/new",
					component: page(() => import("./pages/gallery/edit.vue")),
				},
				{
					path: "gallery/:postId",
					component: page(() => import("./pages/gallery/post.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "gallery",
					component: page(() => import("./pages/gallery/index.vue")),
				},
				{
					path: "channels/:channelId/edit",
					component: page(() => import("./pages/channel-editor.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "channels/new",
					component: page(() => import("./pages/channel-editor.vue")),
				},
				{
					path: "channels",
					component: page(() => import("./pages/channels.vue")),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "channels/:channelId",
					component: page(() => import("./pages/channel.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "custom-emojis-manager",
					component: page(() => import("./pages/custom-emojis-manager.vue")),
				},
				{
					path: "registry/keys/system/:path(.*)?",
					component: page(() => import("./pages/registry.keys.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "registry/value/system/:path(.*)?",
					component: page(() => import("./pages/registry.value.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "registry",
					component: page(() => import("./pages/registry.vue")),
				},
				{
					path: "my/notifications",
					component: page(() => import("./pages/notifications.vue")),
				},
				{
					path: "my/favorites",
					component: page(() => import("./pages/favorites.vue")),
				},
				{
					path: "my/achievements",
					component: page(() => import("./pages/achievements.vue")),
				},
				{
					path: "my/drive/folder/:folder",
					component: page(() => import("./pages/drive.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "my/drive",
					component: page(() => import("./pages/drive.vue")),
				},
				{
					path: "my/follow-requests",
					component: page(() => import("./pages/follow-requests.vue")),
				},
				{
					path: "my/lists/:listId",
					component: page(() => import("./pages/my-lists/list.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "my/lists",
					component: page(() => import("./pages/my-lists/index.vue")),
				},
				{
					path: "my/clips",
					component: page(() => import("./pages/my-clips/index.vue")),
				},
				{
					path: "my/antennas/create",
					component: page(() => import("./pages/my-antennas/create.vue")),
				},
				{
					path: "my/antennas/:antennaId",
					component: page(() => import("./pages/my-antennas/editor.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "my/antennas",
					component: page(() => import("./pages/my-antennas/index.vue")),
				},
				{
					path: "timeline/list/:listId",
					component: page(() => import("./pages/user-list-timeline.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "timeline/antenna/:antennaId",
					component: page(() => import("./pages/antenna-timeline.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "custom-emojis",
					component: page(() => import("./pages/emojis/about.emojis.vue")),
					props: (route) => Object.assign({}, route.query, route.params),
				},
				{
					path: "settings",
					component: page(() => import("./pages/settings/index.vue")),
					children: [
						{
							path: "profile",
							component: page(() => import("./pages/settings/profile.vue")),
						},
						{
							path: "roles",
							component: page(() => import("./pages/settings/roles.vue")),
						},
						{
							path: "privacy",
							component: page(() => import("./pages/settings/privacy.vue")),
						},
						{
							path: "reaction",
							component: page(() => import("./pages/settings/reaction.vue")),
						},
						{
							path: "drive",
							component: page(() => import("./pages/settings/drive.vue")),
						},
						{
							path: "drive/cleaner",
							component: page(
								() => import("./pages/settings/drive-cleaner.vue"),
							),
						},
						{
							path: "notifications",
							component: page(
								() => import("./pages/settings/notifications.vue"),
							),
						},
						{
							path: "email",
							component: page(() => import("./pages/settings/email.vue")),
						},
						{
							path: "security",
							component: page(() => import("./pages/settings/security.vue")),
						},
						{
							path: "general",
							component: page(() => import("./pages/settings/general.vue")),
						},
						{
							path: "feedSettings",
							component: page(
								() => import("./pages/settings/feedSettings.vue"),
							),
						},
						{
							path: "theme/install",
							component: page(
								() => import("./pages/settings/theme.install.vue"),
							),
						},
						{
							path: "theme/manage",
							component: page(
								() => import("./pages/settings/theme.manage.vue"),
							),
						},
						{
							path: "theme",
							component: page(() => import("./pages/settings/theme.vue")),
						},
						{
							path: "navbar",
							component: page(() => import("./pages/settings/navbar.vue")),
						},
						{
							path: "statusbar",
							component: page(() => import("./pages/settings/statusbar.vue")),
						},
						{
							path: "sounds",
							component: page(() => import("./pages/settings/sounds.vue")),
						},
						{
							path: "plugin/install",
							component: page(
								() => import("./pages/settings/plugin.install.vue"),
							),
						},
						{
							path: "plugin",
							component: page(() => import("./pages/settings/plugin.vue")),
						},
						{
							path: "import-export",
							component: page(
								() => import("./pages/settings/import-export.vue"),
							),
						},
						{
							path: "instance-mute",
							component: page(
								() => import("./pages/settings/instance-mute.vue"),
							),
						},
						{
							path: "mute-block",
							component: page(() => import("./pages/settings/mute-block.vue")),
						},
						{
							path: "word-mute",
							component: page(() => import("./pages/settings/word-mute.vue")),
						},
						{
							path: "api",
							component: page(() => import("./pages/settings/api.vue")),
						},
						{
							path: "apps",
							component: page(() => import("./pages/settings/apps.vue")),
						},
						{
							path: "webhook/edit/:webhookId",
							component: page(
								() => import("./pages/settings/webhook.edit.vue"),
							),
							props: (route) => Object.assign({}, route.query, route.params),
						},
						{
							path: "webhook/new",
							component: page(() => import("./pages/settings/webhook.new.vue")),
						},
						{
							path: "webhook",
							component: page(() => import("./pages/settings/webhook.vue")),
						},
						{
							path: "deck",
							component: page(() => import("./pages/settings/deck.vue")),
						},
						{
							path: "preferences-backups",
							component: page(
								() => import("./pages/settings/preferences-backups.vue"),
							),
						},
						{
							path: "migration",
							component: page(() => import("./pages/settings/migration.vue")),
						},
						{
							path: "custom-css",
							component: page(() => import("./pages/settings/custom-css.vue")),
						},
						{
							path: "accounts",
							component: page(() => import("./pages/settings/accounts.vue")),
						},
						{
							path: "subscription",
							component: page(
								() => import("./pages/settings/subscription.vue"),
							),
						},
						{
							path: "points",
							component: page(() => import("./pages/settings/points.vue")),
						},
						{
							path: "invite",
							component: page(() => import("./pages/invite.vue")),
						},
						{
							path: "other",
							component: page(() => import("./pages/settings/other.vue")),
						},
						{
							path: "",
							component: page(() => import("./pages/_empty_.vue")),
						},
					],
				},
				{
					path: "admin",
					component: iAmModerator
						? page(() => import("./pages/admin/index.vue"))
						: page(() => import("./pages/not-found.vue")),
					children: [
						{
							path: "overview",
							component: page(() => import("./pages/admin/overview.vue")),
						},
						{
							path: "users",
							component: page(() => import("./pages/admin/users.vue")),
						},
						{
							path: "emojis",
							component: page(
								() => import("./pages/custom-emojis-manager.vue"),
							),
						},
						{
							path: "queue",
							component: page(() => import("./pages/admin/queue.vue")),
						},
						{
							path: "files",
							component: page(() => import("./pages/admin/files.vue")),
						},
						{
							path: "file/:fileId",
							component: page(() => import("./pages/admin-file.vue")),
							props: (route) => Object.assign({}, route.query, route.params),
						},
						{
							path: "federation",
							component: page(() => import("./pages/admin/federation.vue")),
						},
						{
							path: "announcements",
							component: page(() => import("./pages/admin/announcements.vue")),
						},
						{
							path: "ads",
							component: page(() => import("./pages/admin/ads.vue")),
						},
						{
							path: "roles/:id/edit",
							component: page(() => import("./pages/admin/roles.edit.vue")),
							props: (route) => Object.assign({}, route.query, route.params),
						},
						{
							path: "roles/new",
							component: page(() => import("./pages/admin/roles.edit.vue")),
						},
						{
							path: "roles/:id",
							component: page(() => import("./pages/admin/roles.role.vue")),
							props: (route) => Object.assign({}, route.query, route.params),
						},
						{
							path: "roles",
							component: page(() => import("./pages/admin/roles.vue")),
						},
						{
							path: "subscription-plans",
							component: page(
								() => import("@/pages/admin/subscription-plans.vue"),
							),
						},
						{
							path: "database",
							component: page(() => import("./pages/admin/database.vue")),
						},
						{
							path: "abuses",
							component: page(() => import("./pages/admin/abuses.vue")),
						},
						{
							path: "settings",
							component: page(() => import("./pages/admin/settings.vue")),
						},
						{
							path: "pinnedChannel",
							component: page(() => import("./pages/admin/pinnedChannel.vue")),
						},
						{
							path: "branding",
							component: page(() => import("./pages/admin/branding.vue")),
						},
						{
							path: "moderation",
							component: page(() => import("./pages/admin/moderation.vue")),
						},
						{
							path: "email-settings",
							component: page(() => import("./pages/admin/email-settings.vue")),
						},
						{
							path: "object-storage",
							component: page(() => import("./pages/admin/object-storage.vue")),
						},
						{
							path: "security",
							component: page(() => import("./pages/admin/security.vue")),
						},
						{
							path: "relays",
							component: page(() => import("./pages/admin/relays.vue")),
						},
						{
							path: "instance-block",
							component: page(() => import("./pages/admin/instance-block.vue")),
						},
						{
							path: "proxy-account",
							component: page(() => import("./pages/admin/proxy-account.vue")),
						},
						{
							path: "other-settings",
							component: page(() => import("./pages/admin/other-settings.vue")),
						},
						{
							path: "server-rules",
							component: page(() => import("./pages/admin/server-rules.vue")),
						},
						{
							path: "invites",
							component: page(() => import("./pages/admin/invites.vue")),
						},
						{
							path: "",
							component: page(() => import("./pages/_empty_.vue")),
						},
					],
				},
			],
		},
		{
			name: "signin",
			path: "/signin",
			component: page(() => import("./pages/signin.vue")),
			meta: {
				zen: true,
				redirectToHomeNotVisitor: true,
			},
		},
		{
			name: "signup",
			path: "/signup",
			component: page(() => import("./pages/signup.vue")),
			meta: {
				zen: true,
				redirectToHomeNotVisitor: true,
			},
		},
		{
			path: "/instance-info/:host",
			component: page(() => import("./pages/instance-info.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				zen: true,
			},
		},
		{
			path: "/reset-password/:token?",
			component: page(() => import("./pages/reset-password.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				zen: true,
			},
		},
		{
			path: "/signup-complete/:code",
			component: page(() => import("./pages/signup-complete.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				zen: true,
			},
		},
		{
			path: "/auth/:token",
			component: page(() => import("./pages/auth.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				zen: true,
			},
		},
		{
			path: "/miauth/:session",
			component: page(() => import("./pages/miauth.vue")),
			props: (route) => Object.assign({}, route.query, route.params),
			meta: {
				zen: true,
			},
		},
		{
			name: "index",
			path: "",
			component: page(() => import("./pages/welcome.vue")),
			meta: {
				zen: true,
				redirectToHomeNotVisitor: true,
			},
		},
		{
			path: "/(.+)",
			component: page(() => import("./pages/not-found.vue")),
		},
	],
});

router.beforeEach((to, from, next) => {
	if ($i && to.meta.redirectToHomeNotVisitor) {
		if (uiMode.value === "deck") {
			return next({ path: "/secure/deck" });
		}
		return next({ path: "/secure/timeline" });
	}
	if ($i && to.meta.loginedUserRedirect) {
		return next({ path: `/secure${to.path}` });
	}
	if (!$i && to.meta.loginedUserRedirect) {
		return next({ path: "/signin" });
	}
	if (!$i && to.meta.needLogin) {
		return next({ path: "/signin" });
	}
	if (!$i && to.meta.notLoginedUserRedirect) {
		return next({ path: to.path.slice("/secure".length) });
	}
	if (!$i && to.path.startsWith("/secure")) {
		return next({ path: "/" });
	}
	return next();
});
