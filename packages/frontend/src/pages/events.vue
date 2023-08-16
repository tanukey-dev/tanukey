<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700">
		<div v-if="tab === 'search'">
			<div class="_gaps">
				<MkInput v-model="searchQuery" :large="true" :autofocus="true" type="search">
					<template #prefix><i class="ti ti-search"></i></template>
				</MkInput>
				<MkRadios v-model="searchType" @update:modelValue="search()">
					<option value="nameAndDescription">{{ i18n.ts._channel.nameAndDescription }}</option>
					<option value="nameOnly">{{ i18n.ts._channel.nameOnly }}</option>
				</MkRadios>
				<MkButton large primary gradate rounded @click="search">{{ i18n.ts.search }}</MkButton>
			</div>

			<MkFoldableSection v-if="eventPagination">
				<template #header>{{ i18n.ts.searchResult }}</template>
				<MkEventList :key="key" :pagination="eventPagination"/>
			</MkFoldableSection>
		</div>
		<div v-else-if="tab === 'owned'">
			<MkButton class="new" @click="create()"><i class="ti ti-plus"></i></MkButton>
			<MkEventList :key="key" :pagination="ownedPagination"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import MkEventList from '@/components/MkEventList.vue';
import MkInput from '@/components/MkInput.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkButton from '@/components/MkButton.vue';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import { useRouter } from '@/router';
import { definePageMetadata } from '@/scripts/page-metadata';
import { i18n } from '@/i18n';

const router = useRouter();

const props = defineProps<{
	query: string;
	type?: string;
}>();

let key = $ref('');
let tab = $ref('search');
let searchQuery = $ref('');
let searchType = $ref('nameAndDescription');
let eventPagination = $ref();

onMounted(() => {
	searchQuery = props.query ?? '';
	searchType = props.type ?? 'nameAndDescription';
});

const ownedPagination = {
	endpoint: 'events/owned' as const,
	limit: 10,
};

async function search() {
	const query = searchQuery.toString().trim();

	if (query == null) return;

	const type = searchType.toString().trim();

	eventPagination = {
		endpoint: 'events/search',
		limit: 10,
		params: {
			query: searchQuery,
			type: type,
		},
	};

	key = query + type;
}

function create() {
	router.push('/events/new');
}

const headerActions = $computed(() => [{
	icon: 'ti ti-plus',
	text: i18n.ts.create,
	handler: create,
}]);

const headerTabs = $computed(() => [{
	key: 'search',
	title: i18n.ts.search,
	icon: 'ti ti-search',
}, {
	key: 'owned',
	title: i18n.ts._channel.owned,
	icon: 'ti ti-edit',
}]);

definePageMetadata(computed(() => ({
	title: i18n.ts.event,
	icon: 'ti ti-calendar-event',
})));
</script>
