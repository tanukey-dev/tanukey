<template>
<MkPagination :pagination="pagination">
	<template #empty>
		<div class="_fullinfo">
			<img :src="infoImageUrl" class="_ghost"/>
			<div>{{ i18n.ts.notFound }}</div>
		</div>
	</template>

	<template #default="{ items }">
		<MkEventCirclePreview v-for="item in items" :key="item.id" class="_margin" :eventCircle="item"/>
	</template>
</MkPagination>
</template>

<script lang="ts" setup>
import MkEventCirclePreview from '@/components/MkEventCirclePreview.vue';
import MkPagination, { Paging } from '@/components/MkPagination.vue';
import { i18n } from '@/i18n';
import { infoImageUrl } from '@/instance';

const props = withDefaults(defineProps<{
	pagination: Paging;
	noGap?: boolean;
	extractor?: (item: any) => any;
}>(), {
	extractor: (item) => item,
});
</script>
