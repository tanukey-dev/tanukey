<template>
<div class="_gaps">
	<MkButton v-if="$i && ($i.isModerator || $i.policies.canManageCustomEmojis)" primary link to="/custom-emojis-manager">{{ i18n.ts.manageCustomEmojis }}</MkButton>
	<MkButton v-if="$i && (!$i.isModerator && !$i.policies.canManageCustomEmojis && $i.policies.canRequestCustomEmojis)" primary @click="edit">{{ i18n.ts.requestCustomEmojis }}</MkButton>

	<div class="query">
		<MkInput v-model="q" class="" :placeholder="i18n.ts.search">
			<template #prefix><i class="ti ti-search"></i></template>
		</MkInput>

		<!-- たくさんあると邪魔
		<div class="tags">
			<span class="tag _button" v-for="tag in customEmojiTags" :class="{ active: selectedTags.has(tag) }" @click="toggleTag(tag)">{{ tag }}</span>
		</div>
		-->
	</div>

	<MkFoldableSection v-if="searchEmojis">
		<template #header>{{ i18n.ts.searchResult }}</template>
		<div :class="$style.emojis">
			<XEmoji v-for="emoji in searchEmojis" :key="emoji.name" :emoji="emoji" :draft="emoji.draft"/>
		</div>
	</MkFoldableSection>
	
	<MkFoldableSection v-if="newEmojis.length > 0">
		<template #header>{{ i18n.ts.newEmojis }}</template>
		<div :class="$style.emojis">
			<XEmoji v-for="emoji in newEmojis" :key="emoji.name" :emoji="emoji" :draft="emoji.draft"/>
		</div>
	</MkFoldableSection>

	<MkFoldableSection v-if="draftEmojis.length > 0">
		<template #header>{{ i18n.ts.draftEmojis }}</template>
		<div :class="$style.emojis">
			<XEmoji v-for="emoji in draftEmojis" :key="emoji.name" :emoji="emoji" :draft="emoji.draft"/>
		</div>
	</MkFoldableSection>

	<MkFoldableSection v-for="category in customEmojiCategories" v-once :key="category">
		<template #header>{{ category || i18n.ts.other }}</template>
		<div :class="$style.emojis">
			<XEmoji v-for="emoji in customEmojis.filter(e => e.category === category && !e.draft)" :key="emoji.name" :emoji="emoji" :draft="emoji.draft"/>
		</div>
	</MkFoldableSection>
</div>
</template>

<script lang="ts" setup>
import { watch, defineAsyncComponent } from 'vue';
import * as Misskey from 'misskey-js';
import XEmoji from './emojis.emoji.vue';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import { customEmojis, customEmojiCategories, getCustomEmojiTags } from '@/custom-emojis';
import { i18n } from '@/i18n';
import * as os from '@/os';
import { $i } from '@/account';

const customEmojiTags = getCustomEmojiTags();
let q = $ref('');
let searchEmojis = $ref<Misskey.entities.CustomEmoji[]>(null);
let selectedTags = $ref(new Set());
const newEmojis = customEmojis.value.filter(emoji => {
	if (emoji.updatedAt === null) {
		return false;
	}
	if (emoji.draft) {
		return false;
	}
	// 3日以内の絵文字を抽出
	const checkDate = new Date(emoji.updatedAt);
	checkDate.setDate(checkDate.getDate() + 3);
	return checkDate > new Date();
});
const draftEmojis = customEmojis.value.filter(emoji => emoji.draft);

function search() {
	if ((q === '' || q == null) && selectedTags.size === 0) {
		searchEmojis = null;
		return;
	}

	if (selectedTags.size === 0) {
		const queryarry = q.match(/\:([a-z0-9_]*)\:/g);

		if (queryarry) {
			searchEmojis = customEmojis.value.filter(emoji => 
				queryarry.includes(`:${emoji.name}:`),
			);
		} else {
			searchEmojis = customEmojis.value.filter(emoji => emoji.name.includes(q) || emoji.aliases.includes(q));
		}
	} else {
		searchEmojis = customEmojis.value.filter(emoji => (emoji.name.includes(q) || emoji.aliases.includes(q)) && [...selectedTags].every(t => emoji.aliases.includes(t)));
	}
}

function toggleTag(tag) {
	if (selectedTags.has(tag)) {
		selectedTags.delete(tag);
	} else {
		selectedTags.add(tag);
	}
}

const edit = () => {
	os.popup(defineAsyncComponent(() => import('./emoji-edit-dialog.vue')), {
		isRequest: true,
	}, {
		done: result => {
			window.location.reload();
		},
	}, 'closed');
};

watch($$(q), () => {
	search();
});

watch($$(selectedTags), () => {
	search();
}, { deep: true });
</script>

<style lang="scss" module>
.emojis {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
	grid-gap: 12px;
}
</style>
