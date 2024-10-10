<template>
	<a :href="to" :class="active ? activeClass : null" @click.prevent="nav" @contextmenu.prevent.stop="onContextmenu">
		<slot></slot>
	</a>
</template>

<script lang="ts" setup>
import * as os from "@/os";
import copyToClipboard from "@/scripts/copy-to-clipboard";
import { url } from "@/config";
import { popout as popout_ } from "@/scripts/popout";
import { i18n } from "@/i18n";
import { useRouter } from "@/router";
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

const router = useRouter();
const active = ref(false);

watch(router.getCurrentPathRef(), (newValue): void => {
	if (props.activeClass == null) {
		active.value = false;
		return;
	}
	const resolved = router.resolve(props.to);
	if (resolved == null) {
		active.value = false;
		return;
	}
	const fullPath = router.geFullPathFromResolved(resolved);
	if (newValue.startsWith(fullPath)) {
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
				icon: "ti ti-app-window",
				text: i18n.ts.openInWindow,
				action: () => {
					os.pageWindow(props.to);
				},
			},
			{
				icon: "ti ti-player-eject",
				text: i18n.ts.showInPage,
				action: () => {
					router.push(props.to, "forcePage");
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

function openWindow() {
	os.pageWindow(props.to);
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

	router.push(props.to, ev.ctrlKey ? "forcePage" : null);
}
</script>
