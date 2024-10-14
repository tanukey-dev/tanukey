<template>
	<div :class="{ [$style.center]: page.alignCenter, [$style.serif]: page.font === 'serif' }">
		<template v-if="page.editorVersion === 1">
			<XBlock v-for="child in page.content" :key="child.id" :page="page" :block="child" :h="2" />
		</template>
		<template v-if="page.editorVersion === 2">
			<Mfm :class="$style.mfm" :text="page.text" :author="$i" :i="$i" />
		</template>
	</div>
</template>

<script lang="ts" setup>
import * as Misskey from "misskey-js";
import XBlock from "./page.block.vue";
import { $i } from '@/account';

defineProps<{
	page: Misskey.entities.Page;
}>();
</script>

<style lang="scss" module>
.serif {
	font-family: serif;
}

.center {
	text-align: center;
}
</style>
