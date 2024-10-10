<template>
	<XColumn v-if="deckStore.state.alwaysShowMainColumn" :column="column" :isStacked="isStacked">
		<template #header>
			<template v-if="pageMetadata?.value">
				<i :class="pageMetadata?.value.icon"></i>
				{{ pageMetadata?.value.title }}
			</template>
		</template>

		<div>
			<XTimeline />
		</div>
	</XColumn>
</template>

<script lang="ts" setup>
import { ComputedRef, defineAsyncComponent } from "vue";
import XColumn from "./column.vue";
import { deckStore, Column } from "@/ui/deck/deck-store";
import { PageMetadata, provideMetadataReceiver } from "@/scripts/page-metadata";

defineProps<{
	column: Column;
	isStacked: boolean;
}>();

let pageMetadata = $ref<null | ComputedRef<PageMetadata>>();

const XTimeline = defineAsyncComponent(
	() => import("@/pages/timeline.vue"),
);

provideMetadataReceiver((info) => {
	pageMetadata = info;
});

</script>
