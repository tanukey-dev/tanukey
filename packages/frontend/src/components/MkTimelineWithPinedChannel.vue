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
		<MkTimelineWithScroll
			:src="srcCh"
			:channelId="channelId"
			:sound="true"
		/>
	</MkSpacer>
	<MkLoading v-else/>
</MkStickyContainer>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Tab } from './global/MkPageHeader.tabs.vue';
import { i18n } from '@/i18n';
import { instance } from '@/instance';
import * as os from '@/os';
import MkTimelineWithScroll from '@/components/MkTimelineWithScroll.vue';
import { defaultStore } from '@/store';
import { deviceKind } from '@/scripts/device-kind';
import { scrollToTop } from '@/scripts/scroll';

const props = defineProps<{
	src: string;
}>();

const tabs = ref<Tab[]>([{ key: 'public', title: i18n.ts.public, icon: 'ti ti-world-www' }]);
const src = ref(props.src);
const srcCh = computed(() => tab.value === 'public' ? src.value : 'channel');
const channel = ref<any>(null);
const postChannel = computed(defaultStore.makeGetterSetter('postChannel'));
const tab = ref<string|null>(null);
const selectedTab = computed(defaultStore.makeGetterSetter('selectedChannelTab'));
const channelId = computed(() => tab.value === 'public' ? null : tab.value);
const headerActions = computed(() => []);
const disableSwipe = computed(defaultStore.makeGetterSetter('disableSwipe'));

watch(tab, async () => {
	selectedTab.value = tab.value;

	if (tab.value == null) {
		tab.value = 'public';
	}

	if (tab.value !== null && tab.value !== 'public') {
		let ch = await os.api('channels/show', {
			channelId: tab.value,
		});
		channel.value = ch;
		postChannel.value = ch;
	} else {
		channel.value = null;
		postChannel.value = null;
	}

	scrollToTop(null);
});

onMounted(async () => {
	let t: any[] = [];
	let s: Set<string> = new Set<string>();
	for (let id of instance.pinnedLtlChannelIds) {
		let ch = await os.api('channels/show', {
			channelId: id,
		});
		if (ch != null) {
			if (ch.isVoiceChatEnabled) {
				t.push({ key: ch.id, title: ch.name, icon: 'ti ti-microphone' });
			} else {
				t.push({ key: ch.id, title: ch.name, icon: 'ti ti-device-tv-old' });
			}
			s.add(ch.id);
		}
	}

	let userPinnedLtlChannelIds = defaultStore.makeGetterSetter('userPinnedLtlChannelIds');
	let userIds = userPinnedLtlChannelIds.get();
	for (let id of userIds) {
		if (!s.has(id.value)) {
			let ch = await os.api('channels/show', {
				channelId: id.value,
			});
			if (ch != null) {
				if (ch.isVoiceChatEnabled) {
					t.push({ key: ch.id, title: ch.name, icon: 'ti ti-microphone' });
				} else {
					t.push({ key: ch.id, title: ch.name, icon: 'ti ti-device-tv' });
				}
			}
		}
	}

	tabs.value.push(...t);

	if (selectedTab.value == null) {
		tab.value = 'public';
	} else {
		tab.value = selectedTab.value;
	}
});

const onSwipeLeft = (): void => {
	if (deviceKind === 'desktop') {
		return;
	}
	if (disableSwipe.value) {
		disableSwipe.value = false;
		return;
	}
	const index = tabs.value.findIndex(x => x.key === tab.value);
	if (index < tabs.value.length - 1) {
		tab.value = tabs.value[index + 1].key;
	}
};

const onSwipeRight = (): void => {
	if (deviceKind === 'desktop') {
		return;
	}
	if (disableSwipe.value) {
		disableSwipe.value = false;
		return;
	}
	const index = tabs.value.findIndex(x => x.key === tab.value);
	if (index !== 0) {
		tab.value = tabs.value[index - 1].key;
	}
};

</script>

<style lang="scss" module>
</style>
