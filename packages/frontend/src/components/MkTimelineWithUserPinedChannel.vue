<template>
<MkStickyContainer>
	<template #header>
		<MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="tabs"/>
	</template>
	<MkSpacer
		v-if="tab"
		v-touch:swipe.left="onSwipeLeft"
		v-touch:swipe.right="onSwipeRight"
		:contentMax="800" 
		style="padding: 0;"
	>
		<template v-for="tTab in tabs" :key="tTab.key">
			<MkTimelineWithScroll
				v-if="tTab.key === tab"
				:src="srcCh"
				:channelId="channelId"
				:sound="true"
			/>
		</template>
	</MkSpacer>
	<MkLoading v-else/>
</MkStickyContainer>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, watch, defineAsyncComponent } from 'vue';
import { Tab } from './global/MkPageHeader.tabs.vue';
import { i18n } from '@/i18n';
import * as os from '@/os';
import MkTimelineWithScroll from '@/components/MkTimelineWithScroll.vue';
import { defaultStore } from '@/store';
import { deviceKind } from '@/scripts/device-kind';
import { scrollToTop } from '@/scripts/scroll';

const tabs = ref<Tab[]>([]);
const srcCh = computed(() => 'channel');
const postChannel = computed(defaultStore.makeGetterSetter('postChannel'));
const tab = ref<string|null>(null);
const selectedTab = computed(defaultStore.makeGetterSetter('selectedUserChannelTab'));
const channelId = computed(() => tab.value);
const disableSwipe = computed(defaultStore.makeGetterSetter('disableSwipe'));

watch(tab, async () => {
	selectedTab.value = tab.value;

	if (tab.value !== null) {
		let ch = await os.api('channels/show', {
			channelId: tab.value,
		});
		postChannel.value = ch;
	} else {
		postChannel.value = null;
	}

	scrollToTop(null);
});

onMounted(async () => {
	let t: any[] = [];
	let ids: string[] = [];
	let s: Set<string> = new Set<string>();

	let userPinnedLtlChannelIds = defaultStore.makeGetterSetter('userPinnedLtlChannelIds');
	let userPinnedChIds = userPinnedLtlChannelIds.get();
	for (let id of userPinnedChIds) {
		if (!s.has(id.value)) {
			ids.push(id.value);
			s.add(id.value);
		}
	}

	let pinnedChs = await os.api('channels/show', {
		channelIds: ids,
	});

	if (pinnedChs) {
		for (let ch of pinnedChs) {
			if (ch != null) {
				t.push({ key: ch.id, title: ch.name, icon: 'ti ti-device-tv' });
			}
		}
	}

	tabs.value.push(...t);

	if (selectedTab.value == null) {
		if (tabs.value.length > 0) {
			tab.value = tabs.value[0].key;
		} else {
			tab.value = null;
		}
	} else {
		tab.value = selectedTab.value;
	}
});

const onSwipeLeft = (): void => {
	//モバイル環境のみ
	if (deviceKind === 'desktop') {
		return;
	}
	//AAなどスクロールが必要な場合は無効化
	if (disableSwipe.value) {
		disableSwipe.value = false;
		return;
	}
	const index = tabs.value.findIndex(x => x.key === tab.value);
	if (index < tabs.value.length - 1) {
		tab.value = tabs.value[index + 1].key;
	} else {
		tab.value = tabs.value[0].key;
	}
};

const onSwipeRight = (): void => {
	//モバイル環境のみ
	if (deviceKind === 'desktop') {
		return;
	}
	//AAなどスクロールが必要な場合は無効化
	if (disableSwipe.value) {
		disableSwipe.value = false;
		return;
	}
	//右スワイプで左のタブに移動
	//左端までいったら最終ページに移動
	const index = tabs.value.findIndex(x => x.key === tab.value);
	if (index !== 0) {
		tab.value = tabs.value[index - 1].key;
	} else {
		tab.value = tabs.value[tabs.value.length - 1].key;
	}
};

const headerActions = computed(() => [{
	icon: 'ti ti-caret-down',
	text: i18n.ts.menu,
	handler: dropDownMenu,
	refHandler: getRef,
}]);

let el: any = null;

const getRef = (ref) => {
	el = ref;
};

const dropDownMenu = (ev) => {
	os.popup(defineAsyncComponent(() => import('@/components/MkChannelTabPicker.vue')), {
		currentKey: tab.value,
		tabs: tabs,
		src: el,
	}, {
		changeKey: key => {
			tab.value = key;
		},
	}, 'closed');
};

</script>

<style lang="scss" module>
</style>
