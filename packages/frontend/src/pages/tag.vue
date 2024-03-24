<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<div v-if="tab === 'timeline'" class="_gaps">
		<MkSpacer :contentMax="800">
			<MkNotes ref="notes" class="" :pagination="pagination"/>
		</MkSpacer>
	</div>
	<div v-if="tab === 'channels'" class="_gaps">
		<MkSpacer :contentMax="700">
			<MkPagination v-slot="{items}" :pagination="channelPagination">
				<MkChannelPreview v-for="channel in items" :key="channel.id" class="_margin" :channel="channel"/>
			</MkPagination>
		</MkSpacer>
	</div>
	<template v-if="$i && tab === 'timeline'" #footer>
		<div :class="$style.footer">
			<MkSpacer :contentMax="800" :marginMin="16" :marginMax="16">
				<MkButton rounded primary :class="$style.button" @click="post()"><i class="ti ti-pencil"></i>{{ i18n.ts.postToHashtag }}</MkButton>
			</MkSpacer>
		</div>
	</template>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import MkNotes from '@/components/MkNotes.vue';
import MkChannelPreview from '@/components/MkChannelPreview.vue';
import MkButton from '@/components/MkButton.vue';
import MkPagination from '@/components/MkPagination.vue';
import { definePageMetadata } from '@/scripts/page-metadata';
import { i18n } from '@/i18n';
import { $i } from '@/account';
import { defaultStore } from '@/store';
import * as os from '@/os';

const props = defineProps<{
	tag: string;
}>();

const pagination = {
	endpoint: 'notes/search-by-tag' as const,
	limit: 10,
	params: computed(() => ({
		tag: props.tag,
	})),
};
const notes = ref<InstanceType<typeof MkNotes>>();
const tab = ref('timeline');

async function post() {
	defaultStore.set('postFormHashtags', props.tag);
	defaultStore.set('postFormWithHashtags', true);
	await os.post();
	defaultStore.set('postFormHashtags', '');
	defaultStore.set('postFormWithHashtags', false);
	notes.value?.pagingComponent?.reload();
}

const channelPagination = {
	endpoint: 'channels/search-by-tags' as const,
	limit: 10,
	params: {
		tags: [props.tag],
	},
};

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [{
	key: 'timeline',
	title: i18n.ts.timeline,
	icon: 'ti ti-home',
}, {
	key: 'channels',
	title: i18n.ts.channel,
	icon: 'ti ti-device-tv',
}]);

definePageMetadata(computed(() => ({
	title: props.tag,
	icon: 'ti ti-hash',
})));
</script>

<style lang="scss" module>
.footer {
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
	border-top: solid 0.5px var(--divider);
	display: flex;
}

.button {
		margin: 0 auto var(--margin) auto;
}
</style>
