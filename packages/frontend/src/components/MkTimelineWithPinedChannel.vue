<template>
<MkStickyContainer>
	<template #header>
		<MkPageHeader v-if="tabs.length > 1" v-model:tab="tab" :actions="headerActions" :tabs="tabs"/>
	</template>
	<MkSpacer :contentMax="800" style="padding: 0;">
		<MkTimelineWithScroll
			:key="srckey"
			:src="srcCh"
			:channel="channel"
			:sound="true"
		/>
	</MkSpacer>
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

const props = defineProps<{
	src: string;
}>();

const tabs = ref<Tab[]>([{ key: 'public', title: i18n.ts.public, icon: 'ti ti-world-www' }]);
const src = ref(props.src);
const srcCh = computed(() => tab.value === 'public' ? src.value : 'channel');
const srckey = computed(() => tab.value === 'public' ? src.value : tab.value);
const postChannel = computed(defaultStore.makeGetterSetter('postChannel'));
const tab = computed(defaultStore.makeGetterSetter('selectedChannelTab'));
const channel = computed(() => tab.value === 'public' ? null : tab.value);
const headerActions = computed(() => []);

watch(tab, async () => {
	if (tab.value == null) {
		tab.value = 'public';
	}

	if (tab.value !== null && tab.value !== 'public') {
		let ch = await os.api('channels/show', {
			channelId: tab.value.key,
		});
		postChannel.value = ch;
	} else {
		postChannel.value = null;
	}
});

onMounted(async () => {
	let t: any[] = [];
	let s: Set<string> = new Set<string>();
	for (let id of instance.pinnedLtlChannelIds) {
		let ch = await os.api('channels/show', {
			channelId: id,
		});
		if (ch != null) {
			t.push({ key: ch.id, title: ch.name, icon: 'ti ti-device-tv-old' });
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
				t.push({ key: ch.id, title: ch.name, icon: 'ti ti-device-tv' });
			}
		}
	}

	tabs.value.push(...t);
});

</script>

<style lang="scss" module>
</style>
