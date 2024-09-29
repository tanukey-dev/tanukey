<template>
	<MkSpacer :contentMax="1000" :marginMin="20">
		<div :class="$style.emojis">
			<XEmoji v-for="emoji in emojis" :key="emoji.name" :emoji="emoji" :draft="emoji.draft" />
		</div>
	</MkSpacer>
</template>

<script lang="ts" setup>
import { customEmojis } from "@/custom-emojis";
import XEmoji from "./emojis.emoji.vue";

const emojis = customEmojis.value.filter(
	(emoji) => emoji.uploadedUserName === null || emoji.uploadedUserName === "",
);

</script>

<style lang="scss" module>
.emojis {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
	grid-gap: 12px;
}
</style>
