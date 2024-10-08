<template>
	<span v-if="errored || isDraft">:{{ customEmojiName }}:</span>
	<img v-else :class="[$style.root, { [$style.normal]: normal, [$style.noStyle]: noStyle }]" :src="url" :alt="alt"
		:title="alt" decoding="async" @error="errored = true" @load="errored = false" />
</template>

<script lang="ts" setup>
import { customEmojisMap } from "@/custom-emojis";
import { getProxiedImageUrl, getStaticImageUrl } from "@/scripts/media-proxy";
import { defaultStore } from "@/store";
import { computed } from "vue";

const props = defineProps<{
	name: string;
	normal?: boolean;
	noStyle?: boolean;
	host?: string | null;
	url?: string;
	useOriginalSize?: boolean;
}>();

const customEmojiName = computed(() =>
	(props.name[0] === ":"
		? props.name.substr(1, props.name.length - 2)
		: props.name
	).replace("@.", ""),
);
const isLocal = computed(
	() =>
		!props.host &&
		(customEmojiName.value.endsWith("@.") ||
			!customEmojiName.value.includes("@")),
);
const isDraft = computed(() => {
	const emoji = customEmojisMap.get(customEmojiName.value);
	if (!emoji) return false;
	return emoji.status === 'DRAFT';
});

const rawUrl = computed(() => {
	if (props.url) {
		return props.url;
	}
	if (isLocal.value) {
		return customEmojisMap.get(customEmojiName.value)?.url ?? null;
	}
	return props.host
		? `/emoji/${customEmojiName.value}@${props.host}.webp`
		: `/emoji/${customEmojiName.value}.webp`;
});

const url = computed(() => {
	if (rawUrl.value == null) return null;

	const proxied =
		rawUrl.value.startsWith("/emoji/") ||
			(props.useOriginalSize && isLocal.value)
			? rawUrl.value
			: getProxiedImageUrl(
				rawUrl.value,
				props.useOriginalSize ? undefined : "emoji",
				false,
				true,
			);
	return defaultStore.reactiveState.disableShowingAnimatedImages.value
		? getStaticImageUrl(proxied)
		: proxied;
});

const alt = computed(() => `:${customEmojiName.value}:`);
let errored = $ref(url.value == null);
</script>

<style lang="scss" module>
.root {
	height: 2em;
	vertical-align: middle;
	transition: transform 0.2s ease;
	max-width: 100%;
	object-fit: contain;

	&:hover {
		transform: scale(1.5);
	}
}

.normal {
	height: 1.25em;
	vertical-align: -0.25em;

	&:hover {
		transform: none;
	}
}

.noStyle {
	height: auto !important;
}
</style>
