<template>
	<a :href="to" :class="active ? activeClass : null" @click.prevent="nav" @contextmenu.prevent.stop="onContextmenu">
		<slot></slot>
	</a>
</template>

<script lang="ts" setup>
import * as os from "@/os";
import copyToClipboard from "@/scripts/copy-to-clipboard";
import { url } from "@/config";
import { i18n } from "@/i18n";
import { router } from "@/router";
import { watch, ref } from "vue";

const props = withDefaults(
	defineProps<{
		to: string;
		activeClass?: null | string;
		behavior?: null | "window" | "browser";
		external?: boolean;
	}>(),
	{
		activeClass: null,
		behavior: null,
	},
);

const active = ref(false);

watch(router.currentRoute, (newRoute): void => {
	if (props.activeClass == null) {
		active.value = false;
		return;
	}
	if (newRoute.path === props.to) {
		active.value = true;
		return;
	}
	active.value = false;
}, {
	immediate: true
});

function onContextmenu(ev) {
	const selection = window.getSelection();
	if (selection && selection.toString() !== "") return;
	os.contextMenu(
		[
			{
				type: "label",
				text: props.to,
			},
			{
				icon: "ti ti-player-eject",
				text: i18n.ts.showInPage,
				action: () => {
					router.push(props.to);
				},
			},
			null,
			{
				icon: "ti ti-external-link",
				text: i18n.ts.openInNewTab,
				action: () => {
					window.open(props.to, "_blank");
				},
			},
			{
				icon: "ti ti-link",
				text: i18n.ts.copyLink,
				action: () => {
					copyToClipboard(`${url}${props.to}`);
				},
			},
		],
		ev,
	);
}

function nav(ev: MouseEvent) {
	if (props.external) {
		window.open(props.to, "_blank");
		return;
	}

	if (props.behavior === "browser") {
		location.href = props.to;
		return;
	}

	if (props.behavior) {
		if (props.behavior === "window") {
			return openWindow();
		}
	}

	if (ev.shiftKey) {
		return openWindow();
	}

	console.log(props.to)
	router.push({ path: props.to });
}
</script>
