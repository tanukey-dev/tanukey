<template>
	<div v-if="meta">
		<XSetup v-if="meta.requireSetup" />
		<XEntrance v-else />
	</div>
</template>

<script lang="ts" setup>
import { instanceName } from "@/config";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";
import { computed } from "vue";
import XEntrance from "./welcome.entrance.vue";
import XSetup from "./welcome.setup.vue";

let meta = $ref(null);

os.api("meta", { detail: true }).then((res) => {
	meta = res;
});

definePageMetadata(
	computed(() => ({
		title: instanceName,
		icon: null,
	})),
);
</script>
