<template>
	<MkModalWindow ref="dialog" :width="370" :height="400" :hideCancel="true">
		<template #header>{{ i18n.ts.login }}</template>

		<MkSpacer :marginMin="20" :marginMax="28">
			<MkSignin :autoSet="true" @login="onLogin" />
		</MkSpacer>
	</MkModalWindow>
</template>

<script lang="ts" setup>
import { } from "vue";
import MkSignin from "@/components/MkSignin.vue";
import MkModalWindow from "@/components/MkModalWindow.vue";
import { i18n } from "@/i18n";
import { useRouter } from "@/router";

const router = useRouter();

const dialog = $shallowRef<InstanceType<typeof MkModalWindow>>();

function onLogin() {
	router.push("/secure/timeline");
}
</script>
