<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader v-model:tab="src" :actions="headerActions" :tabs="$i ? headerTabs : headerTabsWhenNotLogin"
				:displayMyAvatar="true" />
		</template>
		<div ref="rootEl">
			<MkTimelineWithPinedChannel v-if="isNeedPinnedChannels()" ref="tlComponent" :key="src" :src="src"
				:sound="true" />
			<MkTimelineWithUserPinedChannel v-else-if="isNeedUserPinnedChannels()" ref="tlComponent" :src="src"
				:sound="true" />
			<MkSpacer v-else :contentMax="800" style="padding: 0;">
				<XCommonTimeline ref="tlComponent" :key="src" :src="src" :sound="true" />
			</MkSpacer>
		</div>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { $i } from "@/account";
import type { Tab } from "@/components/global/MkPageHeader.tabs.vue";
import { i18n } from "@/i18n";
import { instance } from "@/instance";
import * as os from "@/os";
import { router } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { defaultStore } from "@/store";
import MkStickyContainer from "@/components/global/MkStickyContainer.vue";
import MkPageHeader from "@/components/global/MkPageHeader.vue";
import { computed, defineAsyncComponent, provide, ref } from "vue";

provide("shouldOmitHeaderTitle", true);

const XCommonTimeline = defineAsyncComponent(
	() => import("@/components/MkTimelineWithScroll.vue"),
);
const MkTimelineWithPinedChannel = defineAsyncComponent(
	() => import("@/components/MkTimelineWithPinedChannel.vue"),
);
const MkTimelineWithUserPinedChannel = defineAsyncComponent(
	() => import("@/components/MkTimelineWithUserPinedChannel.vue"),
);

function isNeedPinnedChannels(): boolean {
	return src === "recommend";
}

function isNeedUserPinnedChannels(): boolean {
	return src === "feed";
}

const isLocalTimelineAvailable =
	($i == null && instance.policies.ltlAvailable) ||
	($i?.policies.ltlAvailable);
const isGlobalTimelineAvailable =
	($i == null && instance.policies.gtlAvailable) ||
	($i?.policies.gtlAvailable);

let srcWhenNotSignin = $ref(isLocalTimelineAvailable ? "local" : "global");
const src = $computed({
	get: () => ($i ? defaultStore.reactiveState.tl.value.src : srcWhenNotSignin),
	set: (x) => saveSrc(x),
});

async function chooseList(ev: MouseEvent): Promise<void> {
	const lists = await os.api("users/lists/list");
	const items = lists.map((list) => ({
		type: "link" as const,
		text: list.name,
		to: `/secure/timeline/list/${list.id}`,
	}));
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

async function chooseAntenna(ev: MouseEvent): Promise<void> {
	const antennas = await os.api("antennas/list");
	const items = antennas.map((antenna) => ({
		type: "link" as const,
		text: antenna.name,
		indicate: antenna.hasUnreadNote,
		to: `/secure/timeline/antenna/${antenna.id}`,
	}));
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

async function chooseChannel(ev: MouseEvent): Promise<void> {
	const channels = await os.api("channels/my-favorites", {
		limit: 100,
	});
	const items = channels.map((channel) => ({
		type: "link" as const,
		text: channel.name,
		indicate: channel.hasUnreadNote,
		to: `/secure/channels/${channel.id}`,
	}));
	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

function saveSrc(newSrc: "home" | "recommend" | "feed" | "global"): void {
	defaultStore.set("tl", {
		...defaultStore.state.tl,
		src: newSrc,
	});
	srcWhenNotSignin = newSrc;
}

const headerActions = $computed(() => [
	...(src === "feed" ? [{
		icon: "ti ti-settings",
		text: i18n.ts.edit,
		handler: (): void => {
			router.push('/secure/settings/feedSettings');
		},
	}] : []),
	{
		icon: "ti ti-refresh",
		text: i18n.ts.reload,
		handler: (): void => {
			location.reload();
		},
	},
]);

const headerTabs = $computed(
	() =>
		[
			{
				key: "home",
				title: i18n.ts._timelines.home,
				icon: "ti ti-home",
			},
			{
				key: "recommend",
				title: i18n.ts._timelines.recommend,
				icon: "ti ti-sparkles",
			},
			{
				key: "feed",
				title: i18n.ts._timelines.feed,
				icon: "ti ti-timeline",
			},
			{
				icon: "ti ti-list",
				title: i18n.ts.lists,
				iconOnly: true,
				onClick: chooseList,
			},
			{
				icon: "ti ti-antenna",
				title: i18n.ts.antennas,
				iconOnly: true,
				onClick: chooseAntenna,
			},
			{
				icon: "ti ti-device-tv",
				title: i18n.ts.channel,
				iconOnly: true,
				onClick: chooseChannel,
			},
		] as Tab[],
);

const headerTabsWhenNotLogin = $computed(
	() =>
		[
			...(isLocalTimelineAvailable
				? [
					{
						key: "local",
						title: i18n.ts._timelines.local,
						icon: "ti ti-planet",
						iconOnly: true,
					},
				]
				: []),
			...(isGlobalTimelineAvailable
				? [
					{
						key: "global",
						title: i18n.ts._timelines.global,
						icon: "ti ti-whirl",
						iconOnly: true,
					},
				]
				: []),
		] as Tab[],
);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.timeline,
		icon:
			src === "local"
				? "ti ti-planet"
				: src === "social"
					? "ti ti-rocket"
					: src === "global"
						? "ti ti-whirl"
						: "ti ti-home",
	})),
);
</script>

<style lang="scss" module></style>
