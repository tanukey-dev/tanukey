<template>
	<MkSpacer :contentMax="1000" :marginMin="20">
		<div style="display: flex; gap: 10px; padding: 10px;">
			<MkButton v-if="$i && $i.policies.canManageCustomEmojis" primary link to="/secure/custom-emojis-manager">
				{{ i18n.ts.manageCustomEmojis }}
			</MkButton>
			<MkButton v-if="$i && $i.policies.canRequestCustomEmojis" primary @click="edit">
				{{ i18n.ts.requestCustomEmojis }}
			</MkButton>
		</div>

		<div :class="$style.emojis">
			<XEmoji v-for="emoji in emojis" :key="emoji.name" :emoji="emoji" />
		</div>
	</MkSpacer>
</template>

<script lang="ts" setup>
import { $i } from "@/account";
import MkButton from "@/components/MkButton.vue";
import { customEmojis } from "@/custom-emojis";
import { defineAsyncComponent, computed } from "vue";
import XEmoji from "../emojis.emoji.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";

const emojis = computed(() => customEmojis.value.filter((emoji) => emoji.uploadedUserName === $i?.username))

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

</script>

<style lang="scss" module>
.emojis {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
	grid-gap: 12px;
}
</style>
