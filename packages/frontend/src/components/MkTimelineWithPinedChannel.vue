<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="tabs" />
		</template>
		<MkSpacer v-if="tab" v-touch:swipe.left="onSwipeLeft" v-touch:swipe.right="onSwipeRight" :contentMax="800"
			style="padding: 0;">
			<template v-for="tTab in tabs" :key="tTab.key">
				<MkTimelineWithScroll v-if="tTab.key === tab" :src="srcCh" :channelId="channelId" :sound="true" />
			</template>
		</MkSpacer>
		<MkLoading v-else />
	</MkStickyContainer>
</template>
<script lang="ts" setup>
import MkTimelineWithScroll from "@/components/MkTimelineWithScroll.vue";
import { i18n } from "@/i18n";
import { instance } from "@/instance";
import * as os from "@/os";
import { deviceKind } from "@/scripts/device-kind";
import { scrollToTop } from "@/scripts/scroll";
import { defaultStore } from "@/store";
import { MenuItem } from "@/types/menu";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { Tab } from "./global/MkPageHeader.tabs.vue";
import MkStickyContainer from "./global/MkStickyContainer.vue";
import MkPageHeader from "./global/MkPageHeader.vue";
import MkSpacer from "./global/MkSpacer.vue";
import { $i, iAmModerator } from "@/account";
import { onBeforeMount } from "vue";

const props = defineProps<{
	src: string;
}>();

const tabs = ref<Tab[]>([
	{ key: "public", title: i18n.ts.public, icon: "ti ti-planet" },
]);
const srcCh = computed(() =>
	tab.value === "public"
		? $i ? "public" : "local"
		: "channel",
);
const postChannel = computed(defaultStore.makeGetterSetter("postChannel"));
const tab = ref<string>("public");
const selectedTab = computed(
	props.src === "recommend" ? defaultStore.makeGetterSetter("selectedChannelTab") : defaultStore.makeGetterSetter("selectedUserChannelTab"),
);
const channelId = computed(() =>
	tab.value === "public"
		? null
		: tab.value,
);
const disableSwipe = computed(defaultStore.makeGetterSetter("disableSwipe"));

async function channelTabMenu(ev: MouseEvent): Promise<void> {
	const channel = postChannel.value;
	const canEdit =
		($i &&
			($i.id === channel.userId ||
				channel.moderatorUserIds.includes($i.id))) ||
		iAmModerator;

	const items = [{
		type: "link" as const,
		text: i18n.ts.viewChannel,
		icon: "ti ti-device-tv",
		to: `/secure/channels/${postChannel.value.id}`,
	}];

	if (canEdit) {
		items.push({
			type: "link" as const,
			icon: "ti ti-settings",
			text: i18n.ts.viewChannelSettings,
			to: `/secure/channels/${postChannel.value.id}/edit`,
		});
	}

	os.popupMenu(items, ev.currentTarget ?? ev.target);
}

watch(tab, async () => {
	selectedTab.value = tab.value;

	if (tab.value == null) {
		tab.value = "public";
	}

	if (
		tab.value !== "public"
	) {
		const ch = await os.api("channels/show", {
			channelId: tab.value,
		});
		postChannel.value = ch;
	} else {
		postChannel.value = null;
	}

	scrollToTop(null);
});

onBeforeMount(async () => {
	let t: any[] = [];
	let ids: string[] = [];

	if (props.src === "recommend") {
		for (let id of instance.pinnedLtlChannelIds) {
			ids.push(id);
		}

		let pinnedChs = await os.api("channels/show", {
			channelIds: ids,
		});

		if (pinnedChs) {
			for (let ch of pinnedChs) {
				if (ch != null) {
					t.push({ key: ch.id, title: ch.name, icon: "ti ti-device-tv", onRightClick: channelTabMenu });
				}
			}
		}

		tabs.value.push(...t);
	} else {
		const s: Set<string> = new Set<string>();

		const userPinnedLtlChannelIds = defaultStore.makeGetterSetter(
			"userPinnedLtlChannelIds",
		);
		const userPinnedChIds = userPinnedLtlChannelIds.get();
		for (let id of userPinnedChIds) {
			if (!s.has(id.value)) {
				ids.push(id.value);
				s.add(id.value);
			}
		}

		const pinnedChs = await os.api("channels/show", {
			channelIds: ids,
		});

		if (pinnedChs) {
			for (const ch of pinnedChs) {
				if (ch != null) {
					t.push({ key: ch.id, title: ch.name, icon: "ti ti-device-tv", onRightClick: channelTabMenu });
				}
			}
		}

		tabs.value.push(...t);
	}

	if (selectedTab.value == null) {
		if (tabs.value.length > 0) {
			tab.value = tabs.value[0].key;
		} else {
			tab.value = 'public';
		}
	} else {
		tab.value = selectedTab.value;
	}

	// 直前でチャンネルを選択している状態で、
	// パブリックが選択されているおすすめ/フィードに戻った場合に対処
	if (
		tab.value !== "public"
	) {
		const ch = await os.api("channels/show", {
			channelId: tab.value,
		});
		postChannel.value = ch;
	} else {
		postChannel.value = null;
	}

	scrollToTop(null);
});

const onSwipeLeft = (): void => {
	//モバイル環境のみ
	if (deviceKind === "desktop") {
		return;
	}
	//AAなどスクロールが必要な場合は無効化
	if (disableSwipe.value) {
		disableSwipe.value = false;
		return;
	}
	const index = tabs.value.findIndex((x) => x.key === tab.value);
	if (index < tabs.value.length - 1) {
		tab.value = tabs.value[index + 1].key;
	} else {
		tab.value = tabs.value[0].key;
	}
};

const onSwipeRight = (): void => {
	//モバイル環境のみ
	if (deviceKind === "desktop") {
		return;
	}
	//AAなどスクロールが必要な場合は無効化
	if (disableSwipe.value) {
		disableSwipe.value = false;
		return;
	}
	//右スワイプで左のタブに移動
	//左端までいったら最終ページに移動
	const index = tabs.value.findIndex((x) => x.key === tab.value);
	if (index !== 0) {
		tab.value = tabs.value[index - 1].key;
	} else {
		tab.value = tabs.value[tabs.value.length - 1].key;
	}
};

const publicTlShowLocalPost = computed<boolean>(defaultStore.makeGetterSetter("publicTlShowLocalPost"));
const publicTlShowRemoteFollowPost = computed<boolean>(defaultStore.makeGetterSetter("publicTlShowRemoteFollowPost"));
const publicTlShowChannelFollowPost = computed<boolean>(defaultStore.makeGetterSetter("publicTlShowChannelFollowPost"));

const headerActions = computed(() => [
	...(tab.value === 'public' ? [{
		icon: 'ti ti-dots',
		text: i18n.ts.options,
		handler: (ev) => {
			const menuItems: MenuItem[] = [];

			menuItems.push({
				type: 'label',
				text: i18n.ts._publicSettings.label,
			});

			menuItems.push({
				type: 'switch',
				text: i18n.ts._publicSettings.remote,
				ref: publicTlShowRemoteFollowPost
			});

			menuItems.push({
				type: 'switch',
				text: i18n.ts._publicSettings.local,
				ref: publicTlShowLocalPost
			});

			menuItems.push({
				type: 'switch',
				text: i18n.ts._publicSettings.channel,
				ref: publicTlShowChannelFollowPost
			});

			os.popupMenu(menuItems, ev.currentTarget ?? ev.target);
		},
	}] : []),
	{
		icon: "ti ti-caret-down",
		text: i18n.ts.menu,
		handler: dropDownMenu,
		refHandler: getRef,
	},
]);

let el: any = null;

const getRef = (ref) => {
	el = ref;
};

const dropDownMenu = (ev) => {
	os.popup(
		defineAsyncComponent(() => import("@/components/MkChannelTabPicker.vue")),
		{
			currentKey: tab.value,
			tabs: tabs,
			src: el,
		},
		{
			changeKey: (key) => {
				tab.value = key;
			},
		},
		"closed",
	);
};
</script>

<style lang="scss" module></style>
