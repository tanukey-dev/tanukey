<template>
<div class="_gaps_m">
	<FormSection first>
		<template #label>{{ i18n.ts._points.title }}</template>
		<p>{{ point.point }}</p>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as os from '@/os';
import FormSection from '@/components/form/section.vue';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';

const point = ref(0);

async function fetch() {
	point.value = await os.api('points/show');
}

fetch();

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts._points.title,
	icon: 'ti ti-coin',
});
</script>
