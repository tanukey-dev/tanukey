<template>
<XCode
	v-touch:swipe="onTouchTap"
	:code="code"
	:lang="lang"
	:inline="inline"
/>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, computed } from 'vue';
import { defaultStore } from '@/store';

defineProps<{
	code: string;
	lang?: string;
	inline?: boolean;
}>();

const disableSwipe = computed(defaultStore.makeGetterSetter('disableSwipe'));

const onTouchTap = (): void => {
	disableSwipe.value = true;
};

const XCode = defineAsyncComponent(() => import('@/components/MkCode.core.vue'));
</script>
