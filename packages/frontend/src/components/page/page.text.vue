<template>
<div class="_gaps">
	<Mfm :text="block.text" :isNote="false" :i="$i"/>
	<MkUrlPreview v-for="url in urls" :key="url" :url="url"/>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import * as mfm from 'tfm-js';
import * as Misskey from 'misskey-js';
import { extractUrlFromMfm } from '@/scripts/extract-url-from-mfm';
import { $i } from '@/account';

const MkUrlPreview = defineAsyncComponent(() => import('@/components/MkUrlPreview.vue'));

const props = defineProps<{
	block: Misskey.entities.TextBlock,
	page: Misskey.entities.Page,
}>();

const urls = props.block.text ? extractUrlFromMfm(mfm.parse(props.block.text)) : [];
</script>
