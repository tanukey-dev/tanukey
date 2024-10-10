<template>
	<a ref="el" style="word-break: break-all;" class="_link" :href="url" :rel="rel" :target="target" :title="url">
		<slot></slot>
		<i v-if="target === '_blank'" class="ti ti-external-link" :class="$style.icon"></i>
	</a>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref } from "vue";
import { url as local } from "@/config";
import { useTooltip } from "@/scripts/use-tooltip";
import * as os from "@/os";

const props = withDefaults(
	defineProps<{
		url: string;
		rel?: string;
	}>(),
	{},
);

const self = props.url.startsWith(local);
const target = self ? undefined : "_blank";

const el = ref<HTMLElement>();

const popup = (showing, el: HTMLElement) => {
	os.popup(
		defineAsyncComponent(() => import("@/components/MkUrlPreviewPopup.vue")),
		{
			showing,
			url: props.url,
			source: el,
		},
		{},
		"closed",
	);
}

useTooltip(el, (showing) => { if (el.value) popup(showing, el.value) });

</script>

<style lang="scss" module>
.icon {
	padding-left: 2px;
	font-size: .9em;
}
</style>
