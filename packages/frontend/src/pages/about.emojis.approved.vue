<template>
	<MkSpacer :contentMax="1000" :marginMin="20">
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
				<XEmoji v-for="emoji in searchEmojis" :key="emoji.name" :emoji="emoji"
					:draft="emoji.status === 'DRAFT'" />
			</div>
		</MkFoldableSection>

		<MkFoldableSection v-for="category in customEmojiCategories" v-once :key="category" :expanded="false">
			<template #header>{{ category || i18n.ts.other }}</template>
			<div :class="$style.emojis">
				<XEmoji v-for="emoji in customEmojis.filter(e => e.category === category && e.status !== 'DRAFT')"
					:key="emoji.name" :emoji="emoji" :draft="emoji.status === 'DRAFT'" />
			</div>
		</MkFoldableSection>
	</MkSpacer>
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
