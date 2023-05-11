<template>
<MkPagination :pagination="pagination">
	<template #empty>
		<div class="_fullinfo">
			<img src="https://xn--931a.moe/assets/info.jpg" class="_ghost"/>
			<div>{{ i18n.ts.notFound }}</div>
		</div>
	</template>

	<template #default="{ items }">
		<MkPagePreview v-for="item in items" :key="item.id" class="_margin" :page="extractor(item)"/>
	</template>
</MkPagination>
</template>

<script lang="ts" setup>
import MkPagePreview from '@/components/MkPagePreview.vue';
import MkPagination, { Paging } from '@/components/MkPagination.vue';
import { i18n } from '@/i18n';

const props = withDefaults(defineProps<{
	pagination: Paging;
	noGap?: boolean;
	extractor?: (item: any) => any;
}>(), {
	extractor: (item) => item,
});
</script>

<style lang="scss" scoped>
</style>
