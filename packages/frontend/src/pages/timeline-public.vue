<template>
	<MkTimelineWithPinedChannel />
</template>

<script lang="ts" setup>
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { computed, defineAsyncComponent, provide } from "vue";

provide("shouldOmitHeaderTitle", true);

const MkTimelineWithPinedChannel = defineAsyncComponent(
	() => import("@/components/MkTimelineWithPinedChannel.vue"),
);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.timeline,
		icon: "ti ti-timeline",
	})),
);
</script>

<style lang="scss" module></style>
