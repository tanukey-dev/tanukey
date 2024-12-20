import { computed, reactive } from "vue";
import { $i } from "./account";
import { openInstanceMenu } from "./ui/_common_/common";
import { lookup } from "./scripts/lookup";
import { i18n } from "@/i18n";
import { defaultStore } from "@/store";
import { clearCache } from "@/scripts/cache-clear";

export const navbarItemDef = reactive({
	timeline: {
		title: i18n.ts.timeline,
		icon: "ti ti-timeline",
		show: computed(() => $i != null),
		to: "/secure/timeline",
	},
	deck: {
		title: i18n.ts.deck,
		icon: "ti ti-layout-list",
		show: computed(() => $i != null),
		to: "/secure/deck",
	},
	notifications: {
		title: i18n.ts.notifications,
		icon: "ti ti-bell",
		show: computed(() => $i != null),
		indicated: computed(() => $i != null && $i.hasUnreadNotification),
		to: "/secure/my/notifications",
	},
	drive: {
		title: i18n.ts.drive,
		icon: "ti ti-cloud",
		show: computed(() => $i != null),
		to: "/secure/my/drive",
	},
	followRequests: {
		title: i18n.ts.followRequests,
		icon: "ti ti-user-plus",
		show: computed(() => $i != null && $i.isLocked),
		indicated: computed(() => $i != null && $i.hasPendingReceivedFollowRequest),
		to: "/secure/my/follow-requests",
	},
	announcements: {
		title: i18n.ts.announcements,
		icon: "ti ti-speakerphone",
		indicated: computed(() => $i != null && $i.hasUnreadAnnouncement),
		to: "/secure/announcements",
	},
	search: {
		title: i18n.ts.search,
		icon: "ti ti-search",
		to: "/secure/search",
	},
	lookup: {
		title: i18n.ts.lookup,
		icon: "ti ti-world-search",
		action: (ev) => {
			lookup();
		},
	},
	events: {
		title: i18n.ts.event,
		icon: "ti ti-calendar-event",
		to: "/secure/events",
	},
	circles: {
		title: i18n.ts.circle,
		icon: "ti ti-circles-relation",
		to: "/secure/circles",
	},
	lists: {
		title: i18n.ts.lists,
		icon: "ti ti-list",
		show: computed(() => $i != null),
		to: "/secure/my/lists",
	},
	antennas: {
		title: i18n.ts.antennas,
		icon: "ti ti-antenna",
		show: computed(() => $i != null),
		to: "/secure/my/antennas",
	},
	favorites: {
		title: i18n.ts.favorites,
		icon: "ti ti-star",
		show: computed(() => $i != null),
		to: "/secure/my/favorites",
	},
	pages: {
		title: i18n.ts.blog,
		icon: "ti ti-news",
		to: "/secure/pages",
	},
	play: {
		title: "Play",
		icon: "ti ti-player-play",
		to: "/secure/play",
	},
	gallery: {
		title: i18n.ts.gallery,
		icon: "ti ti-icons",
		to: "/secure/gallery",
	},
	clips: {
		title: i18n.ts.clip,
		icon: "ti ti-paperclip",
		show: computed(() => $i != null),
		to: "/secure/my/clips",
	},
	channels: {
		title: i18n.ts.channel,
		icon: "ti ti-device-tv",
		to: "/secure/channels",
	},
	achievements: {
		title: i18n.ts.achievements,
		icon: "ti ti-medal",
		show: computed(() => $i != null),
		to: "/secure/my/achievements",
	},
	about: {
		title: i18n.ts.instanceInfo,
		icon: "ti ti-info-circle",
		to: "/secure/about",
	},
	reload: {
		title: i18n.ts.reload,
		icon: "ti ti-refresh",
		action: (ev) => {
			location.reload();
		},
	},
	switchLightOrDarkMode: {
		title: i18n.ts.switchLightOrDarkMode,
		icon: "ti ti-palette",
		action: (ev) => {
			const mode = defaultStore.makeGetterSetter("darkMode");
			mode.set(!mode.get());
		},
	},
	customEmojis: {
		title: i18n.ts.customEmojis,
		icon: "ti ti-mood-happy",
		to: "/secure/custom-emojis",
	},
	clearCache: {
		title: i18n.ts.clearCache,
		icon: "ti ti-trash",
		action: (ev) => {
			clearCache();
		},
	},
});
