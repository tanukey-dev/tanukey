<template>
<MkStickyContainer>
	<template #header>
		<MkPageHeader v-if="tabs.length > 1" v-model:tab="tab" :actions="headerActions" :tabs="tabs"/>
	</template>
	<MkSpacer :contentMax="800" style="padding: 0;">
		<template v-for="tTab in tabs" :key="tTab.key">
			<MkTimelineWithScroll
				v-if="tTab.key === tab"
				src="channel"
				:channelId="channelId"
				:channel="channel"
				:sound="true"
			/>
		</template>
	</MkSpacer>
</MkStickyContainer>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Tab } from './global/MkPageHeader.tabs.vue';
import * as os from '@/os';
import MkTimelineWithScroll from '@/components/MkTimelineWithScroll.vue';
import { defaultStore } from '@/store';
import { scrollToTop } from '@/scripts/scroll';

const tabs = ref<Tab[]>([]);
const srckey = computed(() => tab.value);
const channel = ref<any>(null);
const postChannel = computed(defaultStore.makeGetterSetter('postChannel'));
const tab = ref<string|null>(null);
const selectedTab = computed(defaultStore.makeGetterSetter('selectedVoiceChannelTab'));
const channelId = computed(() => tab.value);
const headerActions = computed(() => []);

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

</script>

<style lang="scss" module>
</style>
