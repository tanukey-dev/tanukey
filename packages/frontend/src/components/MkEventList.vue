<template>
<MkPagination :pagination="pagination">
	<template #empty>
		<div class="_fullinfo">
			<img :src="infoImageUrl" class="_ghost"/>
			<div>{{ i18n.ts.notFound }}</div>
		</div>
	</template>

	<template #default="{ items }">
		<MkEventPreview v-for="item in items" :key="item.id" class="_margin" :event="extractor(item)"/>
	</template>
</MkPagination>
</template>

<script lang="ts" setup>
import MkEventPreview from "@/components/MkEventPreview.vue";
import MkPagination, { Paging } from "@/components/MkPagination.vue";
import { i18n } from "@/i18n";
import { infoImageUrl } from "@/instance";

const props = withDefaults(
	defineProps<{
		pagination: Paging;
		noGap?: boolean;
		extractor?: (item: any) => any;
	}>(),
	{
		extractor: (item) => item,
	},
);
</script>
