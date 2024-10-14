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
import { router } from "@/router";
import { siteGtagGoogleAdsConversion } from "@/config";

const dialog = $shallowRef<InstanceType<typeof MkModalWindow>>();

function onCancel() {
	router.push("/");
}

function onSignup() {
	if (siteGtagGoogleAdsConversion) {
		// @ts-ignore
		this.$gtag.event('event', 'conversion', { 'send_to': siteGtagGoogleAdsConversion });
	}
	router.push("/signin");
}
</script>

<style lang="scss" module></style>
