<template>
<MkStickyContainer v-if="tabs.length > 1">
	<template #header>
		<MkTab v-model="tab" :tabs="tabs" :class="$style.tab"/>
	</template>
	<MkTimelineWithScroll
		:key="srckey"
		:src="srcCh"
		:channel="tab"
		:sound="true"
	/>
</MkStickyContainer>
<MkTimelineWithScroll
	v-if="tabs.length == 1"
	:key="srckey"
	:src="srcCh"
	:channel="tab"
	:sound="true"
/>
</template>
<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue';
import { ref } from 'vue';
import { i18n } from '@/i18n';
import * as os from '@/os';
import MkTimelineWithScroll from '@/components/MkTimelineWithScroll.vue';
import MkTab from '@/components/MkTab.vue';

const props = defineProps<{
	src: string;
}>();

const tabs = $ref([{ value: null, label: i18n.ts.public }]);
const tab = ref<string|null>(null);
const src = ref(props.src);
const srcCh = computed(() => tab.value === null ? src.value : 'channel');
const srckey = computed(() => tab.value === null ? src.value : tab.value);

onMounted(async () => {
	const meta = await os.api('admin/meta');
	for (let id of meta.pinnedLtlChannelIds) {
		let ch = await os.api('channels/show', {
			channelId: id,
		});
		if (ch != null) {
			tabs.push({ value: ch.id, label: ch.name });
		}
	}
});

</script>

<style lang="scss" module>
.tab {
	margin: calc(var(--margin) / 2) 0;
	padding: calc(var(--margin) / 2) 0;
	background: var(--bg);
}
</style>
