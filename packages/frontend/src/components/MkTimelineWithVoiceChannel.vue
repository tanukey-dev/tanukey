<template>
<MkStickyContainer>
	<template #header>
		<MkPageHeader v-if="tabs.length > 1" v-model:tab="tab" :actions="headerActions" :tabs="tabs"/>
	</template>
	<MkSpacer
		v-if="tab"
		v-touch:swipe.left="onSwipeLeft"
		v-touch:swipe.right="onSwipeRight"
		:contentMax="800" 
		style="padding: 0;"
	>
		<MkTimelineWithScroll
			:key="srckey"
			src="channel"
			:channelId="channelId"
			:channel="channel"
			:sound="true"
		/>
	</MkSpacer>
	<MkLoading v-else/>
</MkStickyContainer>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Tab } from './global/MkPageHeader.tabs.vue';
import * as os from '@/os';
import MkTimelineWithScroll from '@/components/MkTimelineWithScroll.vue';
import { defaultStore } from '@/store';
import { deviceKind } from '@/scripts/device-kind';
import { scrollToTop } from '@/scripts/scroll';

const tabs = ref<Tab[]>([]);
const srckey = computed(() => tab.value);
const channel = ref<any>(null);
const postChannel = computed(defaultStore.makeGetterSetter('postChannel'));
const tab = ref<string|null>(null);
const selectedTab = computed(defaultStore.makeGetterSetter('selectedVoiceChannelTab'));
const channelId = computed(() => tab.value);
const headerActions = computed(() => []);
const disableSwipe = computed(defaultStore.makeGetterSetter('disableSwipe'));

watch(tab, async () => {
	let ch = await os.api('channels/show', {
		channelId: tab.value,
	});
	channel.value = ch;
	postChannel.value = ch;
	selectedTab.value = tab.value;

	scrollToTop(null);
});

onMounted(async () => {
	let t: any[] = [];

	let chs = await os.api('channels/voice-channels');
	if (!chs) {
		return;
	}

	for (let ch of chs) {
		t.push({ key: ch.id, title: ch.name, icon: 'ti ti-microphone' });
	}

	tabs.value = t;

	if (selectedTab.value == null) {
		tab.value = null;
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
