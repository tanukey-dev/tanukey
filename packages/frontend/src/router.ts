import { $i, iAmModerator } from "@/account";
import { createWebHistory, createRouter } from "vue-router";
import { uiMode } from "@/config";

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		// public
		{
			path: "/timeline",
			component: () => import("./pages/timeline-public.vue"),
		},
		{
			path: "/@:initUser/pages/:initPageName/view-source",
			component: () => import("./pages/page-editor/page-editor.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/@:username/pages/:pageName",
			component: () => import("./pages/page.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/@:acct/following",
			component: () => import("./pages/user/following.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/@:acct/followers",
			component: () => import("./pages/user/followers.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/@:acct/:page?",
			component: () => import("./pages/user/index.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/notes/:noteId",
			component: () => import("./pages/note.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/pages",
			component: () => import("./pages/pages.vue"),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/list/:listId",
			component: () => import("./pages/list.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/clips/:clipId",
			component: () => import("./pages/clip.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/play/:id",
			component: () => import("./pages/flash/flash.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/gallery/:postId",
			component: () => import("./pages/gallery/post.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/channels",
			component: () => import("./pages/channels.vue"),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/channels/:channelId",
			component: () => import("./pages/channel.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/events",
			component: () => import("./pages/events.vue"),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/events/:eventId",
			component: () => import("./pages/event.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/events/:eventId/:eventCircleId",
			component: () => import("./pages/event-circle.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/circles",
			component: () => import("./pages/circles.vue"),
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/circles/:circleId",
			component: () => import("./pages/circle.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		{
			path: "/tags/:tag",
			component: () => import("./pages/tag.vue"),
			props: true,
			meta: {
				loginedUserRedirect: true,
			},
		},
		// need login
		{
			path: "/secure",
			children: [
				{
					path: "timeline",
					component: () => import("./pages/timeline.vue"),
				},
				{
					path: "deck",
					component: () => import("./ui/deck.vue"),
				},
				{
					path: "user-info/:userId",
					component: () => import("./pages/user-info.vue"),
					props: true,
				},
				{
					path: "@:initUser/pages/:initPageName/view-source",
					component: () => import("./pages/page-editor/page-editor.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "@:username/pages/:pageName",
					component: () => import("./pages/page.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "@:acct/following",
					component: () => import("./pages/user/following.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "@:acct/followers",
					component: () => import("./pages/user/followers.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "@:acct/:page?",
					component: () => import("./pages/user/index.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "notes/:noteId",
					component: () => import("./pages/note.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "list/:listId",
					component: () => import("./pages/list.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "clips/:clipId",
					component: () => import("./pages/clip.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "announcements",
					component: () => import("./pages/announcements.vue"),
				},
				{
					path: "about",
					component: () => import("./pages/about.vue"),
				},
				{
					path: "about-tanukey",
					component: () => import("./pages/about-tanukey.vue"),
				},
				{
					path: "theme-editor",
					component: () => import("./pages/theme-editor.vue"),
				},
				{
					path: "roles/:role",
					component: () => import("./pages/role.vue"),
					props: true,
				},
				{
					path: "user-tags/:tag",
					component: () => import("./pages/user-tag.vue"),
					props: true,
				},
				{
					path: "search",
					component: () => import("./pages/search.vue"),
				},
				{
					path: "authorize-follow",
					component: () => import("./pages/follow.vue"),
				},
				{
					path: "share",
					component: () => import("./pages/share.vue"),
				},
				{
					path: "tags/:tag",
					component: () => import("./pages/tag.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "pages/new",
					component: () => import("./pages/page-editor/page-editor.vue"),
				},
				{
					path: "pages/edit/:initPageId",
					component: () => import("./pages/page-editor/page-editor.vue"),
					props: true,
				},
				{
					path: "pages",
					component: () => import("./pages/pages.vue"),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "play/:id/edit",
					component: () => import("./pages/flash/flash-edit.vue"),
					props: true,
				},
				{
					path: "play/new",
					component: () => import("./pages/flash/flash-edit.vue"),
				},
				{
					path: "play/:id",
					component: () => import("./pages/flash/flash.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "play",
					component: () => import("./pages/flash/flash-index.vue"),
				},
				{
					path: "gallery/:postId/edit",
					component: () => import("./pages/gallery/edit.vue"),
					props: true,
				},
				{
					path: "gallery/new",
					component: () => import("./pages/gallery/edit.vue"),
				},
				{
					path: "gallery/:postId",
					component: () => import("./pages/gallery/post.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "gallery",
					component: () => import("./pages/gallery/index.vue"),
				},
				{
					path: "channels/:channelId/edit",
					component: () => import("./pages/channel-editor.vue"),
					props: true,
				},
				{
					path: "channels/new",
					component: () => import("./pages/channel-editor.vue"),
				},
				{
					path: "channels",
					component: () => import("./pages/channels.vue"),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "channels/:channelId",
					component: () => import("./pages/channel.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "events",
					component: () => import("./pages/events.vue"),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "events/new",
					component: () => import("./pages/event-editor.vue"),
				},
				{
					path: "events/:eventId/join",
					component: () => import("./pages/event-circle-editor.vue"),
					props: true,
				},
				{
					path: "events/:eventId/edit",
					component: () => import("./pages/event-editor.vue"),
					props: true,
				},
				{
					path: "events/:eventId/:eventCircleId/edit",
					component: () => import("./pages/event-circle-editor.vue"),
					props: true,
				},
				{
					path: "events/:eventId",
					component: () => import("./pages/event.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "events/:eventId/:eventCircleId",
					component: () => import("./pages/event-circle.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "circles",
					component: () => import("./pages/circles.vue"),
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "circles/:circleId",
					component: () => import("./pages/circle.vue"),
					props: true,
					meta: {
						notLoginedUserRedirect: true,
					},
				},
				{
					path: "circles/:circleId/edit",
					component: () => import("./pages/circle-editor.vue"),
					props: true,
				},
				{
					path: "circles/new",
					component: () => import("./pages/circle-editor.vue"),
				},
				{
					path: "custom-emojis-manager",
					component: () => import("./pages/custom-emojis-manager.vue"),
				},
				{
					path: "registry/keys/system/:path(.*)?",
					component: () => import("./pages/registry.keys.vue"),
					props: true,
				},
				{
					path: "registry/value/system/:path(.*)?",
					component: () => import("./pages/registry.value.vue"),
					props: true,
				},
				{
					path: "registry",
					component: () => import("./pages/registry.vue"),
				},
				{
					path: "my/notifications",
					component: () => import("./pages/notifications.vue"),
				},
				{
					path: "my/favorites",
					component: () => import("./pages/favorites.vue"),
				},
				{
					path: "my/achievements",
					component: () => import("./pages/achievements.vue"),
				},
				{
					path: "my/drive/folder/:folder",
					component: () => import("./pages/drive.vue"),
					props: true,
				},
				{
					path: "my/drive",
					component: () => import("./pages/drive.vue"),
				},
				{
					path: "my/follow-requests",
					component: () => import("./pages/follow-requests.vue"),
				},
				{
					path: "my/lists/:listId",
					component: () => import("./pages/my-lists/list.vue"),
					props: true,
				},
				{
					path: "my/lists",
					component: () => import("./pages/my-lists/index.vue"),
				},
				{
					path: "my/clips",
					component: () => import("./pages/my-clips/index.vue"),
				},
				{
					path: "my/antennas/create",
					component: () => import("./pages/my-antennas/create.vue"),
				},
				{
					path: "my/antennas/:antennaId",
					component: () => import("./pages/my-antennas/edit.vue"),
					props: true,
				},
				{
					path: "my/antennas",
					component: () => import("./pages/my-antennas/index.vue"),
				},
				{
					path: "timeline/list/:listId",
					component: () => import("./pages/user-list-timeline.vue"),
					props: true,
				},
				{
					path: "timeline/antenna/:antennaId",
					component: () => import("./pages/antenna-timeline.vue"),
					props: true,
				},
				{
					path: "custom-emojis",
					component: () => import("./pages/about.emojis.vue"),
					props: true,
				},
				{
					path: "settings",
					component: () => import("./pages/settings/index.vue"),
					children: [
						{
							path: "profile",
							component: () => import("./pages/settings/profile.vue"),
						},
						{
							path: "roles",
							component: () => import("./pages/settings/roles.vue"),
						},
						{
							path: "privacy",
							component: () => import("./pages/settings/privacy.vue"),
						},
						{
							path: "reaction",
							component: () => import("./pages/settings/reaction.vue"),
						},
						{
							path: "drive",
							component: () => import("./pages/settings/drive.vue"),
						},
						{
							path: "drive/cleaner",
							component: () => import("./pages/settings/drive-cleaner.vue"),
						},
						{
							path: "notifications",
							component: () => import("./pages/settings/notifications.vue"),
						},
						{
							path: "email",
							component: () => import("./pages/settings/email.vue"),
						},
						{
							path: "security",
							component: () => import("./pages/settings/security.vue"),
						},
						{
							path: "general",
							component: () => import("./pages/settings/general.vue"),
						},
						{
							path: "feedSettings",
							component: () => import("./pages/settings/feedSettings.vue"),
						},
						{
							path: "theme/install",
							component: () => import("./pages/settings/theme.install.vue"),
						},
						{
							path: "theme/manage",
							component: () => import("./pages/settings/theme.manage.vue"),
						},
						{
							path: "theme",
							component: () => import("./pages/settings/theme.vue"),
						},
						{
							path: "navbar",
							component: () => import("./pages/settings/navbar.vue"),
						},
						{
							path: "statusbar",
							component: () => import("./pages/settings/statusbar.vue"),
						},
						{
							path: "sounds",
							component: () => import("./pages/settings/sounds.vue"),
						},
						{
							path: "plugin/install",
							component: () => import("./pages/settings/plugin.install.vue"),
						},
						{
							path: "plugin",
							component: () => import("./pages/settings/plugin.vue"),
						},
						{
							path: "import-export",
							component: () => import("./pages/settings/import-export.vue"),
						},
						{
							path: "instance-mute",
							component: () => import("./pages/settings/instance-mute.vue"),
						},
						{
							path: "mute-block",
							component: () => import("./pages/settings/mute-block.vue"),
						},
						{
							path: "word-mute",
							component: () => import("./pages/settings/word-mute.vue"),
						},
						{
							path: "api",
							component: () => import("./pages/settings/api.vue"),
						},
						{
							path: "apps",
							component: () => import("./pages/settings/apps.vue"),
						},
						{
							path: "webhook/edit/:webhookId",
							component: () => import("./pages/settings/webhook.edit.vue"),
							props: true,
						},
						{
							path: "webhook/new",
							component: () => import("./pages/settings/webhook.new.vue"),
						},
						{
							path: "webhook",
							component: () => import("./pages/settings/webhook.vue"),
						},
						{
							path: "deck",
							component: () => import("./pages/settings/deck.vue"),
						},
						{
							path: "preferences-backups",
							component: () =>
								import("./pages/settings/preferences-backups.vue"),
						},
						{
							path: "migration",
							component: () => import("./pages/settings/migration.vue"),
						},
						{
							path: "custom-css",
							component: () => import("./pages/settings/custom-css.vue"),
						},
						{
							path: "accounts",
							component: () => import("./pages/settings/accounts.vue"),
						},
						{
							path: "subscription",
							component: () => import("./pages/settings/subscription.vue"),
						},
						{
							path: "points",
							component: () => import("./pages/settings/points.vue"),
						},
						{
							path: "invite",
							component: () => import("./pages/invite.vue"),
						},
						{
							path: "other",
							component: () => import("./pages/settings/other.vue"),
						},
						{
							path: "",
							component: () => import("./pages/_empty_.vue"),
						},
					],
				},
				{
					path: "admin",
					component: iAmModerator
						? () => import("./pages/admin/index.vue")
						: () => import("./pages/not-found.vue"),
					children: [
						{
							path: "overview",
							component: () => import("./pages/admin/overview.vue"),
						},
						{
							path: "users",
							component: () => import("./pages/admin/users.vue"),
						},
						{
							path: "emojis",
							component: () => import("./pages/custom-emojis-manager.vue"),
						},
						{
							path: "queue",
							component: () => import("./pages/admin/queue.vue"),
						},
						{
							path: "files",
							component: () => import("./pages/admin/files.vue"),
						},
						{
							path: "file/:fileId",
							component: () => import("./pages/admin-file.vue"),
							props: true,
						},
						{
							path: "federation",
							component: () => import("./pages/admin/federation.vue"),
						},
						{
							path: "announcements",
							component: () => import("./pages/admin/announcements.vue"),
						},
						{
							path: "ads",
							component: () => import("./pages/admin/ads.vue"),
						},
						{
							path: "roles/:id/edit",
							component: () => import("./pages/admin/roles.edit.vue"),
							props: true,
						},
						{
							path: "roles/new",
							component: () => import("./pages/admin/roles.edit.vue"),
						},
						{
							path: "roles/:id",
							component: () => import("./pages/admin/roles.role.vue"),
							props: true,
						},
						{
							path: "roles",
							component: () => import("./pages/admin/roles.vue"),
						},
						{
							path: "subscription-plans",
							component: () => import("@/pages/admin/subscription-plans.vue"),
						},
						{
							path: "database",
							component: () => import("./pages/admin/database.vue"),
						},
						{
							path: "abuses",
							component: () => import("./pages/admin/abuses.vue"),
						},
						{
							path: "settings",
							component: () => import("./pages/admin/settings.vue"),
						},
						{
							path: "pinnedChannel",
							component: () => import("./pages/admin/pinnedChannel.vue"),
						},
						{
							path: "branding",
							component: () => import("./pages/admin/branding.vue"),
						},
						{
							path: "moderation",
							component: () => import("./pages/admin/moderation.vue"),
						},
						{
							path: "email-settings",
							component: () => import("./pages/admin/email-settings.vue"),
						},
						{
							path: "object-storage",
							component: () => import("./pages/admin/object-storage.vue"),
						},
						{
							path: "security",
							component: () => import("./pages/admin/security.vue"),
						},
						{
							path: "relays",
							component: () => import("./pages/admin/relays.vue"),
						},
						{
							path: "instance-block",
							component: () => import("./pages/admin/instance-block.vue"),
						},
						{
							path: "proxy-account",
							component: () => import("./pages/admin/proxy-account.vue"),
						},
						{
							path: "other-settings",
							component: () => import("./pages/admin/other-settings.vue"),
						},
						{
							path: "server-rules",
							component: () => import("./pages/admin/server-rules.vue"),
						},
						{
							path: "invites",
							component: () => import("./pages/admin/invites.vue"),
						},
						{
							path: "",
							component: () => import("./pages/_empty_.vue"),
						},
					],
				},
			],
		},
		{
			name: "signin",
			path: "/signin",
			component: () => import("./pages/signin.vue"),
			meta: {
				zen: true,
				redirectToHomeNotVisitor: true,
			},
		},
		{
			name: "signup",
			path: "/signup",
			component: () => import("./pages/signup.vue"),
			meta: {
				zen: true,
				redirectToHomeNotVisitor: true,
			},
		},
		{
			path: "/instance-info/:host",
			component: () => import("./pages/instance-info.vue"),
			props: true,
			meta: {
				zen: true,
			},
		},
		{
			path: "/reset-password/:token?",
			component: () => import("./pages/reset-password.vue"),
			props: true,
			meta: {
				zen: true,
			},
		},
		{
			path: "/signup-complete/:code",
			component: () => import("./pages/signup-complete.vue"),
			props: true,
			meta: {
				zen: true,
			},
		},
		{
			path: "/auth/:token",
			component: () => import("./pages/auth.vue"),
			props: true,
			meta: {
				zen: true,
			},
		},
		{
			path: "/miauth/:session",
			component: () => import("./pages/miauth.vue"),
			props: true,
			meta: {
				zen: true,
			},
		},
		{
			name: "index",
			path: "",
			component: () => import("./pages/welcome.vue"),
			meta: {
				zen: true,
				redirectToHomeNotVisitor: true,
			},
		},
		{
			path: "/(.+)",
			component: () => import("./pages/not-found.vue"),
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
	if (!$i && to.meta.notLoginedUserRedirect) {
		return next({ path: to.path.slice("/secure".length) });
	}
	if (!$i && to.path.startsWith("/secure")) {
		return next({ path: "/" });
	}
	return next();
});
