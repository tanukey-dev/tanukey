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
				:channelId="tTab.key"
				:sound="true"
			/>
		</template>
	</MkSpacer>
</MkStickyContainer>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref, watch, defineAsyncComponent } from 'vue';
import { Tab } from './global/MkPageHeader.tabs.vue';
import * as os from '@/os';
import MkTimelineWithScroll from '@/components/MkTimelineWithScroll.vue';
import { defaultStore } from '@/store';
import { scrollToTop } from '@/scripts/scroll';
import { i18n } from '@/i18n';

const tabs = ref<Tab[]>([]);
const postChannel = computed(defaultStore.makeGetterSetter('postChannel'));
const tab = ref<string|null>(null);
const selectedTab = computed(defaultStore.makeGetterSetter('selectedVoiceChannelTab'));

watch(tab, async () => {
	let ch = await os.api('channels/show', {
		channelId: tab.value,
	});
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
