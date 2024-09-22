<template>
<div
	v-touch:swipe="onTouchTap"
	class="asciiart"
	:class="asciiArtDarkMode ? '' : $style.default"
>
	{{ text }}
</div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { defaultStore } from "@/store";

const disableSwipe = computed(defaultStore.makeGetterSetter("disableSwipe"));
const asciiArtDarkMode = computed(
	defaultStore.makeGetterSetter("asciiArtDarkMode"),
);

defineProps<{
	text: string;
}>();

const onTouchTap = (): void => {
	disableSwipe.value = true;
};
</script>

<style lang="scss" module>

.default {
	background: #ffffff;
	color: #000000;
}

</style>
