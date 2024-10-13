<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" />
		</template>
		<MkSpacer :contentMax="700">
			<div v-if="tab === 'owned'">
				<MkButton class="new" @click="create()"><i class="ti ti-plus"></i></MkButton>
				<MkPagination v-slot="{ items }" :pagination="ownedPagination">
					<MkCirclePreview v-for="circle in items" :key="circle.id" class="_margin" :circle="circle" />
				</MkPagination>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import MkCirclePreview from "@/components/MkCirclePreview.vue";
import MkPagination from "@/components/MkPagination.vue";
import MkButton from "@/components/MkButton.vue";
import { router } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";

const props = defineProps<{
	query: string;
	type?: string;
}>();

let key = $ref("");
let tab = $ref("owned");

const ownedPagination = {
	endpoint: "circles/owned" as const,
	limit: 10,
};

function create() {
	router.push("/secure/circles/new");
}

const headerActions = $computed(() => [
	{
		icon: "ti ti-plus",
		text: i18n.ts.create,
		handler: create,
	},
]);

const headerTabs = $computed(() => [
	{
		key: "owned",
		title: i18n.ts._channel.owned,
		icon: "ti ti-edit",
	},
]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.circle,
		icon: "ti ti-circles-relation",
	})),
);
</script>
