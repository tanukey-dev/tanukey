import { computed, reactive } from "vue";
import { $i } from "./account";
import { miLocalStorage } from "./local-storage";
import { openInstanceMenu } from "./ui/_common_/common";
import { lookup } from "./scripts/lookup";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { ui } from "@/config";
import { unisonReload } from "@/scripts/unison-reload";
import { defaultStore } from "@/store";
import { clearCache } from "@/scripts/cache-clear";
import { useRouter } from "@/router";

const router = useRouter();

export const navbarItemDef = reactive({
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
	explore: {
		title: i18n.ts.explore,
		icon: "ti ti-hash",
		to: "/secure/explore",
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
		title: i18n.ts.pages,
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
	ui: {
		title: i18n.ts.switchUi,
		icon: "ti ti-devices",
		action: (ev) => {
			os.popupMenu(
				[
					{
						text: i18n.ts.default,
						active: ui === "default" || ui === null,
						action: () => {
							miLocalStorage.setItem("ui", "default");
							router.push("/");
						},
					},
					{
						text: i18n.ts.deck,
						active: ui === "deck",
						action: () => {
							miLocalStorage.setItem("ui", "deck");
							router.push("/");
						},
					},
					{
						text: i18n.ts.classic,
						active: ui === "classic",
						action: () => {
							miLocalStorage.setItem("ui", "classic");
							router.push("/");
						},
					},
				],
				ev.currentTarget ?? ev.target,
			);
		},
	},
	about: {
		title: i18n.ts.about,
		icon: "ti ti-info-circle",
		action: (ev) => {
			openInstanceMenu(ev);
		},
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
		icon: "ti ti-icons",
		to: "/secure/about#emojis",
	},
	clearCache: {
		title: i18n.ts.clearCache,
		icon: "ti ti-trash",
		action: (ev) => {
			clearCache();
		},
	},
});
