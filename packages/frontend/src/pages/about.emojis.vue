<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" />
		</template>
		<MkSpacer v-if="tab === 'emojis'" :contentMax="1000" :marginMin="20">
			<MkButton v-if="$i && ($i.isModerator || $i.policies.canManageCustomEmojis)" primary link
				to="/custom-emojis-manager">{{ i18n.ts.manageCustomEmojis }}</MkButton>
			<MkButton
				v-if="$i && (!$i.isModerator && !$i.policies.canManageCustomEmojis && $i.policies.canRequestCustomEmojis)"
				primary @click="edit">{{ i18n.ts.requestCustomEmojis }}</MkButton>

			<div style="margin-top: 10px;">
				<MkInput v-model="q" class="" :placeholder="i18n.ts.search">
					<template #prefix><i class="ti ti-search"></i></template>
				</MkInput>
			</div>

			<MkFoldableSection v-if="searchEmojis">
				<template #header>{{ i18n.ts.searchResult }}</template>
				<div :class="$style.emojis">
					<XEmoji v-for="emoji in searchEmojis" :key="emoji.name" :emoji="emoji" :draft="emoji.draft" />
				</div>
			</MkFoldableSection>

			<MkFoldableSection v-for="category in customEmojiCategories" v-once :key="category" :expanded="false">
				<template #header>{{ category || i18n.ts.other }}</template>
				<div :class="$style.emojis">
					<XEmoji v-for="emoji in customEmojis.filter(e => e.category === category && !e.draft)"
						:key="emoji.name" :emoji="emoji" :draft="emoji.draft" />
				</div>
			</MkFoldableSection>
		</MkSpacer>
		<NewEmojis v-if="tab === 'new'" />
		<DraftEmojis v-if="tab === 'draft'" />
		<DeletedEmojis v-if="tab === 'deleted'" />
		<ManagedEmojis v-if="tab === 'managed'" />
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { $i } from "@/account";
import MkButton from "@/components/MkButton.vue";
import MkFoldableSection from "@/components/MkFoldableSection.vue";
import MkInput from "@/components/MkInput.vue";
import { customEmojiCategories, customEmojis } from "@/custom-emojis";
import { i18n } from "@/i18n";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";
import * as Misskey from "misskey-js";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import XEmoji from "./emojis.emoji.vue";


const NewEmojis = defineAsyncComponent(() => import('./about.emojis.new.vue'));
const DraftEmojis = defineAsyncComponent(() => import('./about.emojis.draft.vue'));
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
		key: "deleted",
		title: i18n.ts.deletedEmojis,
	},
	{
		key: "managed",
		title: i18n.ts.manage,
	},
]);

definePageMetadata(ref({}));

const q = $ref("");
let searchEmojis = $ref<Misskey.entities.CustomEmoji[]>(null);
const selectedTags = $ref(new Set());

function search() {
	if ((q === "" || q == null) && selectedTags.size === 0) {
		searchEmojis = null;
		return;
	}

	if (selectedTags.size === 0) {
		const queryarry = q.match(/\:([a-z0-9_]*)\:/g);

		if (queryarry) {
			searchEmojis = customEmojis.value.filter((emoji) =>
				queryarry.includes(`:${emoji.name}:`),
			);
		} else {
			searchEmojis = customEmojis.value.filter(
				(emoji) => emoji.name.includes(q) || emoji.aliases.includes(q),
			);
		}
	} else {
		searchEmojis = customEmojis.value.filter(
			(emoji) =>
				(emoji.name.includes(q) || emoji.aliases.includes(q)) &&
				[...selectedTags].every((t) => emoji.aliases.includes(t)),
		);
	}
}

const edit = () => {
	os.popup(
		defineAsyncComponent(() => import("@/components/MkEmojiEditDialog.vue")),
		{
			isRequest: true,
		},
		{
			done: (result) => {
				window.location.reload();
			},
		},
		"closed",
	);
};

watch($$(q), () => {
	search();
});

watch(
	$$(selectedTags),
	() => {
		search();
	},
	{ deep: true },
);
</script>

<style lang="scss" module>
.emojis {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
	grid-gap: 12px;
}
</style>
