<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" />
		</template>

		<MkSpacer v-if="tab === 'note'" :contentMax="800">
			<div v-if="notesSearchAvailable">
				<XNote />
			</div>
			<div v-else>
				<MkInfo warn>{{ i18n.ts.notesSearchNotAvailable }}</MkInfo>
			</div>
		</MkSpacer>

		<MkSpacer v-else-if="tab === 'user'" :contentMax="800">
			<XUser />
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { $i } from "@/account";
import MkInfo from "@/components/MkInfo.vue";
import { i18n } from "@/i18n";
import { instance } from "@/instance";
import { definePageMetadata } from "@/scripts/page-metadata";
import { computed, ref } from "vue";
import MkPageHeader from "@/components/global/MkPageHeader.vue";
import MkStickyContainer from "@/components/global/MkStickyContainer.vue";
import XNote from "./search.note.vue";
import XUser from "./search.user.vue";

const tab = ref("note");

const notesSearchAvailable =
	($i == null && instance.policies.canSearchNotes) ||
	($i != null && $i.policies.canSearchNotes);

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [
	{
		key: "note",
		title: i18n.ts.notes,
		icon: "ti ti-pencil",
	},
	{
		key: "user",
		title: i18n.ts.users,
		icon: "ti ti-users",
	},
]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.search,
		icon: "ti ti-search",
	})),
);
</script>
