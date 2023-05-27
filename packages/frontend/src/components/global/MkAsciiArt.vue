<template>
<div
	v-touch:swipe="onTouchTap"
	class="asciiart"
>
	{{ text }}
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { defaultStore } from '@/store';

const disableSwipe = computed(defaultStore.makeGetterSetter('disableSwipe'));

defineProps<{
	text: string;
}>();

const onTouchTap = (): void => {
	disableSwipe.value = true;
};

</script>
