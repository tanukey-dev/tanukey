<template>
<MkStickyContainer>
	<template #header>
		<MkTab v-if="tabs.length > 1" v-model="tab" :tabs="tabs" :class="$style.tab"/>
	</template>
	<MkSpacer :content-max="800" style="padding: 0;">
		<MkTimelineWithScroll
			:key="srckey"
			:src="srcCh"
			:channel="tab"
			:sound="true"
		/>
	</MkSpacer>
</MkStickyContainer>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { i18n } from '@/i18n';
import { instance } from '@/instance';
import * as os from '@/os';
import MkTimelineWithScroll from '@/components/MkTimelineWithScroll.vue';
import MkTab from '@/components/MkTab.vue';
import { defaultStore } from '@/store';

const props = defineProps<{
	src: string;
}>();

const tabs = $ref([{ value: null, label: i18n.ts.public }]);
const src = ref(props.src);
const srcCh = computed(() => tab.value === null ? src.value : 'channel');
const srckey = computed(() => tab.value === null ? src.value : tab.value);
let postChannel = computed(defaultStore.makeGetterSetter('postChannel'));
let tab = computed(defaultStore.makeGetterSetter('selectedChannelTab'));

watch(tab, async () => {
	if (tab.value) {
		let channel = await os.api('channels/show', {
			channelId: tab.value,
		});
		postChannel.value = channel;
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
			t.push({ value: ch.id, label: ch.name });
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
				t.push({ value: ch.id, label: ch.name });
			}
		}
	}

	tabs.push(...t);
});

</script>

<style lang="scss" module>
.tab {
	margin: calc(var(--margin) / 2) 0;
	padding: calc(var(--margin) / 2) 0;
	background: var(--bg);
}
</style>
