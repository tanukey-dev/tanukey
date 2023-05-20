<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700">
		<div v-if="tab === 'search'" class="rknalgpo">
			<div class="_gaps">
				<MkInput v-model="searchQuery" :large="true" :autofocus="true" type="search">
					<template #prefix><i class="ti ti-search"></i></template>
				</MkInput>
				<MkButton large primary gradate rounded @click="search">{{ i18n.ts.search }}</MkButton>
			</div>

			<MkFoldableSection v-if="searchPagePagination">
				<template #header>{{ i18n.ts.searchResult }}</template>
				<MkPageList :pagination="searchPagePagination"/>
			</MkFoldableSection>
		</div>
		
		<div v-if="tab === 'featured'" class="rknalgpo">
			<MkPagination v-slot="{items}" :pagination="featuredPagesPagination">
				<MkPagePreview v-for="page in items" :key="page.id" class="ckltabjg" :page="page"/>
			</MkPagination>
		</div>

		<div v-else-if="tab === 'my'" class="rknalgpo my">
			<MkButton class="new" @click="create()"><i class="ti ti-plus"></i></MkButton>
			<MkPagination v-slot="{items}" :pagination="myPagesPagination">
				<MkPagePreview v-for="page in items" :key="page.id" class="ckltabjg" :page="page"/>
			</MkPagination>
		</div>

		<div v-else-if="tab === 'liked'" class="rknalgpo">
			<MkPagination v-slot="{items}" :pagination="likedPagesPagination">
				<MkPagePreview v-for="like in items" :key="like.page.id" class="ckltabjg" :page="like.page"/>
			</MkPagination>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import MkPagePreview from '@/components/MkPagePreview.vue';
import MkPagination from '@/components/MkPagination.vue';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import MkPageList from '@/components/MkPageList.vue';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import { useRouter } from '@/router';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

const router = useRouter();

let key = $ref('');
let tab = $ref('search');
let searchQuery = $ref('');
let searchPagePagination = $ref();

const featuredPagesPagination = {
	endpoint: 'pages/featured' as const,
	noPaging: true,
};
const myPagesPagination = {
	endpoint: 'i/pages' as const,
	limit: 5,
};
const likedPagesPagination = {
	endpoint: 'i/page-likes' as const,
	limit: 5,
};

function create() {
	router.push('/pages/new');
}

async function search() {
	const query = searchQuery.toString().trim();

	if (query == null) return;

	searchPagePagination = {
		endpoint: 'pages/search',
		limit: 10,
		params: {
			query: query,
		},
	};

	key = query;
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
	key: 'featured',
	title: i18n.ts._pages.featured,
	icon: 'ti ti-flare',
}, {
	key: 'my',
	title: i18n.ts._pages.my,
	icon: 'ti ti-edit',
}, {
	key: 'liked',
	title: i18n.ts._pages.liked,
	icon: 'ti ti-heart',
}]);

definePageMetadata(computed(() => ({
	title: i18n.ts.pages,
	icon: 'ti ti-note',
})));
</script>

<style lang="scss" scoped>
.rknalgpo {
	&.my .ckltabjg:first-child {
		margin-top: 16px;
	}

	.ckltabjg:not(:last-child) {
		margin-bottom: 8px;
	}

	@media (min-width: 500px) {
		.ckltabjg:not(:last-child) {
			margin-bottom: 16px;
		}
	}
}
</style>
