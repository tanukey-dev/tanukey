<template>
	<div :class="$style.root" style="container-type: inline-size;">
		<Suspense>
			<router-view />
		</Suspense>
		<XCommon />
	</div>
</template>

<script lang="ts" setup>
import { provide, ComputedRef } from "vue";
import XCommon from "./_common_/common.vue";
import { router } from "@/router";
import { PageMetadata, provideMetadataReceiver } from "@/scripts/page-metadata";
import { instanceName } from "@/config";

let pageMetadata = $ref<null | ComputedRef<PageMetadata>>();

provide("router", router);
provideMetadataReceiver((info) => {
	pageMetadata = info;
	if (pageMetadata.value) {
		document.title = `${pageMetadata.value.title} | ${instanceName}`;
	}
});

document.documentElement.style.overflowY = "scroll";
</script>

<style lang="scss" module>
.root {
	min-height: 100dvh;
	box-sizing: border-box;
}
</style>
