<template>
	<MkModalWindow ref="dialog" :width="500" :height="600" :hideCancel="true">
		<template #header>{{ i18n.ts.signup }}</template>

		<div style="overflow-x: clip;">
			<XSignup :autoSet="true" @done="onSignup" @cancel="onCancel" />
		</div>
	</MkModalWindow>
</template>

<script lang="ts" setup>
import MkModalWindow from "@/components/MkModalWindow.vue";
import XSignup from "@/components/MkSignup.vue";
import { i18n } from "@/i18n";
import { } from "vue";
import { useRouter } from "@/router";

const router = useRouter();

const dialog = $shallowRef<InstanceType<typeof MkModalWindow>>();

function onCancel() {
	router.push("/");
}

function onSignup() {
	router.push("/secure/timeline");
}
</script>

<style lang="scss" module></style>
