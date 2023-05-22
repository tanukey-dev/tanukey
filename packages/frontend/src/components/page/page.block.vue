<template>
<XText v-if="block.type == 'text'" :key="block.id" :page="page" :block="block" :h="h"/>
<XSection v-if="block.type == 'section'" :key="block.id" :page="page" :block="block" :h="h"/>
<XImage v-if="block.type == 'image'" :key="block.id" :page="page" :block="block" :h="h"/>
<XNote v-if="block.type == 'note'" :key="block.id" :page="page" :block="block" :h="h"/>
</template>

<script lang="ts" setup>
import * as Misskey from 'misskey-js';
import XText from './page.text.vue';
import XSection from './page.section.vue';
import XImage from './page.image.vue';
import XNote from './page.note.vue';

defineProps<{
	block: Misskey.entities.Block,
	h: number,
	page: Misskey.entities.Page,
}>();

</script>
