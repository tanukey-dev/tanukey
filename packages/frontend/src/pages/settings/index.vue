<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader :actions="headerActions" :tabs="headerTabs" />
		</template>
		<MkSpacer :contentMax="900" :marginMin="20" :marginMax="32">
			<div ref="el" class="vvcocwet" :class="{ wide: !narrow }">
				<div class="body">
					<div v-if="!narrow || currentPath === '/secure/settings'" class="nav">
						<div class="baaadecd">
							<MkInfo v-if="emailNotConfigured" warn class="info">{{ i18n.ts.emailNotConfiguredWarning }}
								<MkA to="/secure/settings/email" class="_link">{{ i18n.ts.configure }}</MkA>
							</MkInfo>
							<MkSuperMenu :def="menuDef" :grid="narrow"></MkSuperMenu>
						</div>
					</div>
					<div v-if="!(narrow && currentPath === '/secure/settings')" class="main">
						<div class="bkzroven" style="container-type: inline-size;" ref="contents">
							<RouterView />
						</div>
					</div>
				</div>
			</div>
		</MkSpacer>
	</mkstickycontainer>
</template>

<script setup lang="ts">
import { $i, signout } from "@/account";
import MkInfo from "@/components/MkInfo.vue";
import MkSuperMenu from "@/components/MkSuperMenu.vue";
import { i18n } from "@/i18n";
import { instance } from "@/instance";
import * as os from "@/os";
import { router } from "@/router";
import { clearCache } from "@/scripts/cache-clear";
import {
	definePageMetadata,
	provideMetadataReceiver,
} from "@/scripts/page-metadata";
import {
	computed,
	onActivated,
	onMounted,
	onUnmounted,
	ref,
	shallowRef,
	watch,
} from "vue";
import RouterView from "@/components/global/RouterView.vue";

const indexInfo = {
	title: i18n.ts.settings,
	icon: "ti ti-settings",
	hideHeader: true,
};
const INFO = ref(indexInfo);
const el = shallowRef<HTMLElement | null>(null);
const childInfo = ref(null);

const contents = shallowRef<HTMLElement>();
const currentPath = computed(() => router.currentRoute.value.path);

let narrow = $ref(false);
const NARROW_THRESHOLD = 600;

const ro = new ResizeObserver((entries, observer) => {
	if (entries.length === 0) return;
	narrow = entries[0].borderBoxSize[0].inlineSize < NARROW_THRESHOLD;
});

function isActive(path: string): boolean {
	if (router.currentRoute.value.path === path) {
		return true;
	}
	return false;
}

const menuDef = computed(() => [
	{
		title: i18n.ts.basicSettings,
		items: [
			{
				icon: "ti ti-user",
				text: i18n.ts.profile,
				to: "/secure/settings/profile",
				active: isActive("/secure/settings/profile")
			},
			{
				icon: "ti ti-lock-open",
				text: i18n.ts.privacy,
				to: "/secure/settings/privacy",
				active: isActive("/secure/settings/privacy")
			},
			{
				icon: "ti ti-mood-happy",
				text: i18n.ts.reaction,
				to: "/secure/settings/reaction",
				active: isActive("/secure/settings/reaction")
			},
			{
				icon: "ti ti-cloud",
				text: i18n.ts.drive,
				to: "/secure/settings/drive",
				active: isActive("/secure/settings/drive")
			},
			{
				icon: "ti ti-bell",
				text: i18n.ts.notifications,
				to: "/secure/settings/notifications",
				active: isActive("/secure/settings/notifications")
			},
			{
				icon: "ti ti-mail",
				text: i18n.ts.email,
				to: "/secure/settings/email",
				active: isActive("/secure/settings/email")
			},
			{
				icon: "ti ti-lock",
				text: i18n.ts.security,
				to: "/secure/settings/security",
				active: isActive("/secure/settings/security")
			},
		],
	},
	{
		title: i18n.ts.clientSettings,
		items: [
			{
				icon: "ti ti-adjustments",
				text: i18n.ts.general,
				to: "/secure/settings/general",
				active: isActive("/secure/settings/general")
			},
			{
				icon: "ti ti-timeline",
				text: i18n.ts.feedSettings,
				to: "/secure/settings/feedSettings",
				active: isActive("/secure/settings/feedSettings")
			},
			{
				icon: "ti ti-palette",
				text: i18n.ts.theme,
				to: "/secure/settings/theme",
				active: isActive("/secure/settings/theme")
			},
			{
				icon: "ti ti-menu-2",
				text: i18n.ts.navbar,
				to: "/secure/settings/navbar",
				active: isActive("/secure/settings/navbar")
			},
			{
				icon: "ti ti-equal-double",
				text: i18n.ts.statusbar,
				to: "/secure/settings/statusbar",
				active: isActive("/secure/settings/statusbar")
			},
			{
				icon: "ti ti-music",
				text: i18n.ts.sounds,
				to: "/secure/settings/sounds",
				active: isActive("/secure/settings/sounds")
			},
			{
				icon: "ti ti-plug",
				text: i18n.ts.plugins,
				to: "/secure/settings/plugin",
				active: isActive("/secure/settings/plugin")
			},
		],
	},
	{
		title: i18n.ts.otherSettings,
		items: [
			instance.enableSubscriptions
				? {
					icon: "ti ti-credit-card",
					text: i18n.ts.subscription,
					to: "/secure/settings/subscription",
					active: isActive("/secure/settings/subscription")
				}
				: undefined,
			{
				icon: "ti ti-parking",
				text: i18n.ts.points,
				to: "/secure/settings/points",
				active: isActive("/secure/settings/points")
			},
			$i && ($i.isAdmin || $i.policies.canInvite) && instance.disableRegistration ? {
				icon: "ti ti-users-plus",
				text: i18n.ts.invite,
				to: "/secure/settings/invite",
				active: isActive("/secure/settings/invite")
			} : undefined,
			{
				icon: "ti ti-badges",
				text: i18n.ts.roles,
				to: "/secure/settings/roles",
				active: isActive("/secure/settings/roles")
			},
			{
				icon: "ti ti-planet-off",
				text: i18n.ts.instanceMute,
				to: "/secure/settings/instance-mute",
				active: isActive("/secure/settings/instance-mute")
			},
			{
				icon: "ti ti-ban",
				text: i18n.ts.muteAndBlock,
				to: "/secure/settings/mute-block",
				active: isActive("/secure/settings/mute-block")
			},
			{
				icon: "ti ti-message-off",
				text: i18n.ts.wordMute,
				to: "/secure/settings/word-mute",
				active: isActive("/secure/settings/word-mute")
			},
			{
				icon: "ti ti-api",
				text: "API",
				to: "/secure/settings/api",
				active: isActive("/secure/settings/api")
			},
			{
				icon: "ti ti-webhook",
				text: "Webhook",
				to: "/secure/settings/webhook",
				active: isActive("/secure/settings/webhook")
			},
			{
				icon: "ti ti-package",
				text: i18n.ts.importAndExport,
				to: "/secure/settings/import-export",
				active: isActive("/secure/settings/import-export")
			},
			{
				icon: "ti ti-plane",
				text: `${i18n.ts.accountMigration} (${i18n.ts.experimental})`,
				to: "/secure/settings/migration",
				active: isActive("/secure/settings/migration")
			},
			{
				icon: "ti ti-dots",
				text: i18n.ts.other,
				to: "/secure/settings/other",
				active: isActive("/secure/settings/other")
			},
		],
	},
	{
		items: [
			{
				icon: "ti ti-device-floppy",
				text: i18n.ts.preferencesBackups,
				to: "/secure/settings/preferences-backups",
				active: isActive("/secure/settings/preferences-backups")
			},
			{
				type: "button",
				icon: "ti ti-trash",
				text: i18n.ts.clearCache,
				action: clearCache,
			},
			{
				type: "button",
				icon: "ti ti-power",
				text: i18n.ts.logout,
				action: async () => {
					const { canceled } = await os.confirm({
						type: "warning",
						text: i18n.ts.logoutConfirm,
					});
					if (canceled) return;
					signout();
				},
				danger: true,
			},
		],
	},
]);

watch($$(narrow), () => {
	if (currentPath.value === "/secure/settings" && !narrow) {
		router.push("/secure/settings/profile");
	}
});

onMounted(() => {
	ro.observe(el.value);

	narrow = el.value.offsetWidth < NARROW_THRESHOLD;
	if (currentPath.value === "/secure/settings" && !narrow) {
		router.push("/secure/settings/profile");
	}
});

onActivated(() => {
	narrow = el.value.offsetWidth < NARROW_THRESHOLD;
	if (currentPath.value === "/secure/settings" && !narrow) {
		router.push("/secure/settings/profile");
	}
});

onUnmounted(() => {
	ro.disconnect();
});

watch(currentPath, (to) => {
	if (to === "/secure/settings" && !narrow) {
		router.push("/secure/settings/profile");
	}
});

const emailNotConfigured = computed(
	() => instance.enableEmail && ($i.email == null || !$i.emailVerified),
);

provideMetadataReceiver((info) => {
	if (info == null) {
		childInfo.value = null;
	} else {
		childInfo.value = info;
	}
});

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata(INFO);
// w 890
// h 700
</script>

<style lang="scss" scoped>
.vvcocwet {
	>.body {
		>.nav {
			.baaadecd {
				>.info {
					margin: 16px 0;
				}

				>.accounts {
					>.avatar {
						display: block;
						width: 50px;
						height: 50px;
						margin: 8px auto 16px auto;
					}
				}
			}
		}

		>.main {
			.bkzroven {}
		}
	}

	&.wide {
		>.body {
			display: flex;
			height: 100%;

			>.nav {
				width: 34%;
				padding-right: 32px;
				box-sizing: border-box;
			}

			>.main {
				flex: 1;
				min-width: 0;
			}
		}
	}
}
</style>
