<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" />
		</template>
		<Emojis v-if="tab === 'emojis'" />
		<NewEmojis v-if="tab === 'new'" />
		<DraftEmojis v-if="tab === 'draft'" />
		<RejectedEmojis v-if="tab === 'rejected'" />
		<DeletedEmojis v-if="tab === 'deleted'" />
		<ManagedEmojis v-if="tab === 'managed'" />
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { defineAsyncComponent, computed } from "vue";


const Emojis = defineAsyncComponent(() => import('./about.emojis.approved.vue'));
const NewEmojis = defineAsyncComponent(() => import('./about.emojis.new.vue'));
const DraftEmojis = defineAsyncComponent(() => import('./about.emojis.draft.vue'));
const RejectedEmojis = defineAsyncComponent(() => import('./about.emojis.rejected.vue'));
const DeletedEmojis = defineAsyncComponent(() => import('./about.emojis.unknown.vue'));
const ManagedEmojis = defineAsyncComponent(() => import('./about.emojis.managed.vue'));

const tab = $ref("emojis");
const headerActions = $computed(() => []);
const headerTabs = $computed(() => [
	{
		key: "emojis",
		title: i18n.ts.list,
	},
	{
		key: "new",
		title: i18n.ts.newEmojis,
	},
	{
		key: "draft",
		title: i18n.ts.draftEmojis,
	},
	{
		key: "rejected",
		title: i18n.ts.rejected,
	},
	{
		key: "deleted",
		title: i18n.ts.deletedEmojis,
	},
	{
		key: "managed",
		title: i18n.ts.manage,
	},
]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.customEmojis,
		icon: "ti ti-mood-happy",
	})),
);

</script>

<style lang="scss" module>
.emojis {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
	grid-gap: 12px;
}
</style>
