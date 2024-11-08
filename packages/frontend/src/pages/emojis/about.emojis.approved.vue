<template>
	<MkSpacer :contentMax="1000" :marginMin="20">
		<div style="margin-top: 10px;">
			<MkInput v-model="q" class="" :placeholder="i18n.ts.search">
				<template #prefix><i class="ti ti-search"></i></template>
			</MkInput>
		</div>

		<MkFoldableSection v-if="searchEmojis">
			<template #header>{{ i18n.ts.searchResult }}</template>
			<div :class="$style.emojis">
				<XEmoji v-for="emoji in searchEmojis" :key="emoji.name" :emoji="emoji" />
			</div>
		</MkFoldableSection>

		<MkFoldableSection v-for="category in customEmojiCategories" v-once :key="category" :expanded="false">
			<template #header>{{ category || i18n.ts.other }}</template>
			<div :class="$style.emojis">
				<XEmoji v-for="emoji in customEmojis.filter(e => e.category === category && e.status === 'APPROVED')"
					:key="emoji.name" :emoji="emoji" />
			</div>
		</MkFoldableSection>
	</MkSpacer>
</template>

<script lang="ts" setup>
import MkFoldableSection from "@/components/MkFoldableSection.vue";
import MkInput from "@/components/MkInput.vue";
import { customEmojiCategories, customEmojis } from "@/custom-emojis";
import { i18n } from "@/i18n";
import * as Misskey from "misskey-js";
import { defineAsyncComponent, watch } from "vue";
import XEmoji from "../emojis.emoji.vue";

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
