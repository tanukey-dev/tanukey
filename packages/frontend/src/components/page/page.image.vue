<template>
<div>
	<ImgWithBlurhash v-if="image" style="max-width: 100%;" :hash="image.blurhash" :src="image.url" :alt="image.comment" :title="image.comment" :width="image.properties.width" :height="image.properties.height" :cover="false"/>
</div>
</template>

<script lang="ts" setup>
import {} from "vue";
import * as Misskey from "misskey-js";
import ImgWithBlurhash from "@/components/MkImgWithBlurhash.vue";

const props = defineProps<{
	block: Misskey.entities.ImageBlock;
	page: Misskey.entities.Page;
}>();

const image = props.page.attachedFiles.find((x) => x.id === props.block.fileId);
</script>
