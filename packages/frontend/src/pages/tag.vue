<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :content-max="800">
		<div v-if="tab === 'all'">
			<MkNotes class="" :pagination="pagination"/>
		</div>
		<div v-else-if="tab === 'localOnly'">
			<MkNotes class="" :pagination="localOnlyPagination"/>
		</div>
		<div v-else-if="tab === 'withFiles'">
			<MkNotes class="" :pagination="withFilesPagination"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import MkNotes from '@/components/MkNotes.vue';
import { definePageMetadata } from '@/scripts/page-metadata';
import { i18n } from '@/i18n';

let tab = $ref('all');

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

const localOnlyPagination = {
	endpoint: 'notes/search-by-tag' as const,
	limit: 10,
	params: computed(() => ({
		tag: props.tag,
		local: true,
	})),
};

const withFilesPagination = {
	endpoint: 'notes/search-by-tag' as const,
	limit: 10,
	params: computed(() => ({
		tag: props.tag,
		withFiles: true,
	})),
};

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [{
	key: 'all',
	title: i18n.ts.all,
}, {
	key: 'localOnly',
	title: i18n.ts.localOnly,
}, {
	key: 'withFiles',
	title: i18n.ts.withFiles,
}]);

definePageMetadata(computed(() => ({
	title: props.tag,
	icon: 'ti ti-hash',
})));
</script>
