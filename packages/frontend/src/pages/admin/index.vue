<template>
	<div ref="el" class="hiyeyicy" :class="{ wide: !narrow }">
		<div v-if="!narrow || currentPath === '/secure/admin'" class="nav">
			<MkSpacer :contentMax="700" :marginMin="16">
				<div class="lxpfedzu">
					<div class="banner">
						<img :src="instance.iconUrl || '/favicon.ico'" alt="" class="icon" />
					</div>

					<MkInfo v-if="thereIsUnresolvedAbuseReport" warn class="info">{{
						i18n.ts.thereIsUnresolvedAbuseReportWarning }} <MkA to="/secure/admin/abuses" class="_link">{{
							i18n.ts.check }}</MkA>
					</MkInfo>
					<MkInfo v-if="noMaintainerInformation" warn class="info">{{ i18n.ts.noMaintainerInformationWarning
						}} <MkA to="/secure/admin/settings" class="_link">{{ i18n.ts.configure }}</MkA>
					</MkInfo>
					<MkInfo v-if="noBotProtection" warn class="info">{{ i18n.ts.noBotProtectionWarning }} <MkA
							to="/secure/admin/security" class="_link">{{ i18n.ts.configure }}</MkA>
					</MkInfo>
					<MkInfo v-if="noEmailServer" warn class="info">{{ i18n.ts.noEmailServerWarning }} <MkA
							to="/secure/admin/email-settings" class="_link">{{ i18n.ts.configure }}</MkA>
					</MkInfo>

					<MkSuperMenu :def="menuDef" :grid="narrow"></MkSuperMenu>
				</div>
			</MkSpacer>
		</div>
		<div v-if="!(narrow && currentPath === '/secure/admin')" class="main" ref="contents">
			<RouterView />
		</div>
	</div>
</template>

<script lang="ts" setup>
import MkInfo from "@/components/MkInfo.vue";
import MkSuperMenu from "@/components/MkSuperMenu.vue";
import { i18n } from "@/i18n";
import { instance } from "@/instance";
import * as os from "@/os";
import { useRouter } from "@/router";
import { lookupUser } from "@/scripts/lookup-user";
import {
	definePageMetadata,
	provideMetadataReceiver,
} from "@/scripts/page-metadata";
import RouterView from "@/components/global/RouterView.vue";
import { onActivated, onMounted, onUnmounted, provide, watch, shallowRef } from "vue";
import { useScrollPositionManager } from "@/nirax";
import { getScrollContainer } from "@/scripts/scroll";

const isEmpty = (x: string | null) => x == null || x === "";

const router = useRouter();
const contents = shallowRef<HTMLElement>();
const currentPath = router.getCurrentPathRef();

useScrollPositionManager(() => getScrollContainer(contents.value), router, "/secure/admin/settings");

const indexInfo = {
	title: i18n.ts.controlPanel,
	icon: "ti ti-settings",
	hideHeader: true,
};

provide("shouldOmitHeaderTitle", false);

let INFO = $ref(indexInfo);
let childInfo = $ref(null);
let narrow = $ref(false);
let view = $ref(null);
let el = $ref(null);
let pageProps = $ref({});
let noMaintainerInformation =
	isEmpty(instance.maintainerName) || isEmpty(instance.maintainerEmail);
let noBotProtection =
	!instance.disableRegistration &&
	!instance.enableHcaptcha &&
	!instance.enableRecaptcha &&
	!instance.enableTurnstile;
let noEmailServer = !instance.enableEmail;
let thereIsUnresolvedAbuseReport = $ref(false);

os.api("admin/abuse-user-reports", {
	state: "unresolved",
	limit: 1,
}).then((reports) => {
	if (reports.length > 0) thereIsUnresolvedAbuseReport = true;
});

const NARROW_THRESHOLD = 600;
const ro = new ResizeObserver((entries, observer) => {
	if (entries.length === 0) return;
	narrow = entries[0].borderBoxSize[0].inlineSize < NARROW_THRESHOLD;
});

function isActive(path: string): boolean {
	const resolved = router.resolve(path);
	if (resolved == null) {
		return false;
	}
	const fullPath = router.geFullPathFromResolved(resolved);
	if (currentPath.value.startsWith(fullPath)) {
		return true;
	}
	return false;
}

const menuDef = $computed(() => [
	{
		title: i18n.ts.quickAction,
		items: [
			{
				type: "button",
				icon: "ti ti-search",
				text: i18n.ts.lookup,
				action: lookup,
			},
			...(instance.disableRegistration
				? [
					{
						type: "button",
						icon: "ti ti-user-plus",
						text: i18n.ts.createInviteCode,
						action: invite,
					},
				]
				: []),
		],
	},
	{
		title: i18n.ts.administration,
		items: [
			{
				icon: "ti ti-dashboard",
				text: i18n.ts.dashboard,
				to: "/secure/admin/overview",
				active: isActive("/secure/admin/overview")
			},
			{
				icon: "ti ti-users",
				text: i18n.ts.users,
				to: "/secure/admin/users",
				active: isActive("/secure/admin/users")
			},
			{
				icon: "ti ti-user-plus",
				text: i18n.ts.invite,
				to: "/secure/admin/invites",
				active: isActive("/secure/admin/invites")
			},
			{
				icon: "ti ti-badges",
				text: i18n.ts.roles,
				to: "/secure/admin/roles",
				active: isActive("/secure/admin/roles")
			},
			instance.enableSubscriptions
				? {
					icon: "ti ti-credit-card",
					text: i18n.ts.subscription,
					to: "/secure/admin/subscription-plans",
					active: isActive("/secure/admin/subscription-plans")
				}
				: undefined,
			{
				icon: "ti ti-icons",
				text: i18n.ts.customEmojis,
				to: "/secure/admin/emojis",
				active: isActive("/secure/admin/emojis")
			},
			{
				icon: "ti ti-whirl",
				text: i18n.ts.federation,
				to: "/secure/admin/federation",
				active: isActive("/secure/admin/federation")
			},
			{
				icon: "ti ti-clock-play",
				text: i18n.ts.jobQueue,
				to: "/secure/admin/queue",
				active: isActive("/secure/admin/queue")
			},
			{
				icon: "ti ti-cloud",
				text: i18n.ts.files,
				to: "/secure/admin/files",
				active: isActive("/secure/admin/files")
			},
			{
				icon: "ti ti-speakerphone",
				text: i18n.ts.announcements,
				to: "/secure/admin/announcements",
				active: isActive("/secure/admin/announcements")
			},
			{
				icon: "ti ti-ad",
				text: i18n.ts.ads,
				to: "/secure/admin/ads",
				active: isActive("/secure/admin/ads")
			},
			{
				icon: "ti ti-exclamation-circle",
				text: i18n.ts.abuseReports,
				to: "/secure/admin/abuses",
				active: isActive("/secure/admin/abuses")
			},
		],
	},
	{
		title: i18n.ts.settings,
		items: [
			{
				icon: "ti ti-settings",
				text: i18n.ts.general,
				to: "/secure/admin/settings",
				active: isActive("/secure/admin/settings")
			},
			{
				icon: "ti ti-device-tv",
				text: i18n.ts.pinnedChannel,
				to: "/secure/admin/pinnedChannel",
				active: isActive("/secure/admin/pinnedChannel")
			},
			{
				icon: "ti ti-paint",
				text: i18n.ts.branding,
				to: "/secure/admin/branding",
				active: isActive("/secure/admin/branding")
			},
			{
				icon: "ti ti-shield",
				text: i18n.ts.moderation,
				to: "/secure/admin/moderation",
				active: isActive("/secure/admin/moderation")
			},
			{
				icon: "ti ti-mail",
				text: i18n.ts.emailServer,
				to: "/secure/admin/email-settings",
				active: isActive("/secure/admin/email-settings")
			},
			{
				icon: "ti ti-cloud",
				text: i18n.ts.objectStorage,
				to: "/secure/admin/object-storage",
				active: isActive("/secure/admin/object-storage")
			},
			{
				icon: "ti ti-lock",
				text: i18n.ts.security,
				to: "/secure/admin/security",
				active: isActive("/secure/admin/security")
			},
			{
				icon: "ti ti-planet",
				text: i18n.ts.relays,
				to: "/secure/admin/relays",
				active: isActive("/secure/admin/relays")
			},
			{
				icon: "ti ti-ban",
				text: i18n.ts.instanceBlocking,
				to: "/secure/admin/instance-block",
				active: isActive("/secure/admin/instance-block")
			},
			{
				icon: "ti ti-ghost",
				text: i18n.ts.proxyAccount,
				to: "/secure/admin/proxy-account",
				active: isActive("/secure/admin/proxy-account")
			},
			{
				icon: "ti ti-adjustments",
				text: i18n.ts.other,
				to: "/secure/admin/other-settings",
				active: isActive("/secure/admin/other-settings")
			},
		],
	},
	{
		title: i18n.ts.info,
		items: [
			{
				icon: "ti ti-database",
				text: i18n.ts.database,
				to: "/secure/admin/database",
				active: isActive("/secure/admin/database")
			},
		],
	},
]);

watch(narrow, () => {
	if (currentPath.value === "/secure/admin" && !narrow) {
		router.push("/secure/admin/overview");
	}
});

onMounted(() => {
	ro.observe(el);

	narrow = el.offsetWidth < NARROW_THRESHOLD;
	if (currentPath.value === "/secure/admin" && !narrow) {
		router.push("/secure/admin/overview");
	}
});

onActivated(() => {
	narrow = el.offsetWidth < NARROW_THRESHOLD;
	if (currentPath.value === "/secure/admin" && !narrow) {
		router.push("/secure/admin/overview");
	}
});

onUnmounted(() => {
	ro.disconnect();
});

watch(currentPath, (to) => {
	if (to === "/secure/admin" && !narrow) {
		router.push("/secure/admin/overview");
	}
});

provideMetadataReceiver((info) => {
	if (info == null) {
		childInfo = null;
	} else {
		childInfo = info;
	}
});

const invite = () => {
	os.api("admin/invite/create")
		.then((x) => {
			os.alert({
				type: "info",
				text: x?.[0].code,
			});
		})
		.catch((err) => {
			os.alert({
				type: "error",
				text: err,
			});
		});
};

const lookup = (ev) => {
	os.popupMenu(
		[
			{
				text: i18n.ts.user,
				icon: "ti ti-user",
				action: () => {
					lookupUser();
				},
			},
			{
				text: i18n.ts.note,
				icon: "ti ti-pencil",
				action: () => {
					alert("TODO");
				},
			},
			{
				text: i18n.ts.file,
				icon: "ti ti-cloud",
				action: () => {
					alert("TODO");
				},
			},
			{
				text: i18n.ts.instance,
				icon: "ti ti-planet",
				action: () => {
					alert("TODO");
				},
			},
		],
		ev.currentTarget ?? ev.target,
	);
};

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata(INFO);

defineExpose({
	header: {
		title: i18n.ts.controlPanel,
	},
});
</script>

<style lang="scss" scoped>
.hiyeyicy {
	&.wide {
		display: flex;
		margin: 0 auto;
		height: 100%;

		>.nav {
			width: 32%;
			max-width: 280px;
			box-sizing: border-box;
			border-right: solid 0.5px var(--divider);
			overflow: auto;
			height: 100%;
		}

		>.main {
			flex: 1;
			min-width: 0;
		}
	}

	>.nav {
		.lxpfedzu {
			>.info {
				margin: 16px 0;
			}

			>.banner {
				margin: 16px;

				>.icon {
					display: block;
					margin: auto;
					height: 42px;
					border-radius: 8px;
				}
			}
		}
	}
}
</style>
