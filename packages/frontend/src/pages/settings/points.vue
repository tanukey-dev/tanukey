<template>
<div class="_gaps_m">
	<FormSection first>
		<template #label>{{ i18n.ts._points.title }}</template>
		<p>{{ floorPoint }}</p>
		<MkButton primary @click="sendPoints">{{ i18n.ts._points.send }}</MkButton>
	</FormSection>
</div>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent, computed } from 'vue';
import * as os from '@/os';
import FormSection from '@/components/form/section.vue';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import MkButton from '@/components/MkButton.vue';

const point = ref<{ point: number }>({ point: 0 });
const floorPoint = computed(() => Math.floor(point.value.point));

function sendPoints() {
	os.popup(defineAsyncComponent(() => import('@/components/MkSendPointsWindow.vue')), {}, {
		done: async result => {
			const { target, value } = result;
			await os.api('points/send', {
				userId: target.id,
				value: value,
			});

			fetch();
		},
	}, 'closed');
}

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
