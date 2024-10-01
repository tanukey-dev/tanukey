<template>
	<MkModalWindow ref="dialog" :width="400" :height="150" @close="dialog.close()">
		<template v-if="emoji" #header>:{{ emoji.name }}:</template>
		<div>
			<MkSpacer :marginMin="20" :marginMax="28">
				<div>{{ i18n.ts.username }} : <template v-if="emoji.uploadedUserName">
						<MkMention :username="emoji.uploadedUserName" :host="host" :external="true" />
					</template>
				</div>
				<div v-if="emoji.uploadedUserName !== null">{{ i18n.ts.license }} : {{ emoji.license }}</div>
			</MkSpacer>
		</div>
	</MkModalWindow>
</template>

<script lang="ts" setup>
import MkModalWindow from "@/components/MkModalWindow.vue";
import { host } from "@/config";
import { i18n } from "@/i18n";
import MkMention from "./MkMention.vue";

defineProps<{
	emoji?: any;
}>();

const dialog = $ref(null);
</script>
