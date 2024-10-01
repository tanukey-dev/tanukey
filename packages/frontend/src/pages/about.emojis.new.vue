<template>
	<MkSpacer :contentMax="1000" :marginMin="20">
		<div :class="$style.emojis">
			<XEmoji v-for="emoji in emojis" :key="emoji.name" :emoji="emoji" :draft="emoji.draft" />
		</div>
	</MkSpacer>
</template>

<script lang="ts" setup>
import { customEmojis } from "@/custom-emojis";
import { computed } from 'vue';
import XEmoji from "./emojis.emoji.vue";

const emojis = computed(() => customEmojis.value.filter((emoji) => {
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
}));

</script>

<style lang="scss" module>
.emojis {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
	grid-gap: 12px;
}
</style>
