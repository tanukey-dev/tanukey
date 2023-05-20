<template>
<component :is="type" :key="block.id" :page="page" :block="block" :h="h"/>
</template>

<script lang="ts" setup>
import { onMounted, shallowRef, defineAsyncComponent } from 'vue';
import * as Misskey from 'misskey-js';
import { Block } from './block.type';

const props = defineProps<{
	block: Block,
	h: number,
	page: Misskey.entities.Page,
}>();

const type = shallowRef();

onMounted(() => {
	switch (props.block.type) {
		case 'text':
			type.value = defineAsyncComponent(() => import('./page.text.vue'));
			break;
		case 'section':
			type.value = defineAsyncComponent(() => import('./page.section.vue'));
			break;
		case 'image':
			type.value = defineAsyncComponent(() => import('./page.image.vue'));
			break;
		default:
			type.value = defineAsyncComponent(() => import('./page.note.vue'));
			break;
	}
});

</script>
