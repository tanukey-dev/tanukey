<template>
<MkStickyContainer>
	<template #header><XHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<FormSuspense :p="init">
			<div class="_gaps_s">
				<MkSwitch v-model="enableChartsForRemoteUser">
					<template #label>{{ i18n.ts.enableChartsForRemoteUser }}</template>
				</MkSwitch>

				<MkSwitch v-model="enableChartsForFederatedInstances">
					<template #label>{{ i18n.ts.enableChartsForFederatedInstances }}</template>
				</MkSwitch>

				<MkButton class="button" inline danger @click="startFullIndex()"> Create Full Index </MkButton>

				<span>Full Index: {{ running ? 'Running' : indexingError ? 'Error' : 'Finish' }}</span>
				<span>{{ index > total ? total : index }} / {{ total }} ( {{ progress.toFixed(2) }} %)</span>
				<div class="step-progress-container">
					<div class="step-progress" :style="('width: ' + progress + '%')"></div>	
				</div>	
			</div>
		</FormSuspense>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import XHeader from './_header_.vue';
import FormSuspense from '@/components/form/suspense.vue';
import * as os from '@/os';
import { fetchInstance } from '@/instance';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import { useInterval } from '@/scripts/use-interval';
import MkSwitch from '@/components/MkSwitch.vue';
import MkButton from '@/components/MkButton.vue';

let enableChartsForRemoteUser: boolean = $ref(false);
let enableChartsForFederatedInstances: boolean = $ref(false);
const running = ref(false);
const total = ref(0);
const index = ref(0);
const indexingError = ref(false);
const progress = computed(() => {
	if (index.value > total.value) return 100;
	return (index.value / total.value) * 100; 
});

async function init() {
	const meta = await os.api('admin/meta');
	enableChartsForRemoteUser = meta.enableChartsForRemoteUser;
	enableChartsForFederatedInstances = meta.enableChartsForFederatedInstances;
}

function save() {
	os.apiWithDialog('admin/update-meta', {
		enableChartsForRemoteUser,
		enableChartsForFederatedInstances,
	}).then(() => {
		fetchInstance();
	});
}

function startFullIndex() {
	os.apiWithDialog('admin/full-index');
}

const getIndexStats = async () => {
	const ret = await os.api('admin/full-index-stats')
	running.value = ret.running;
	total.value = ret.total;
	index.value = ret.index;
	indexingError.value = ret.indexingError;
};

useInterval(getIndexStats, 10000, {
	immediate: true,
	afterMounted: true,
});

const headerActions = $computed(() => [{
	asFullButton: true,
	icon: 'ti ti-check',
	text: i18n.ts.save,
	handler: save,
}]);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.other,
	icon: 'ti ti-adjustments',
});
</script>

<style lang="scss" scoped>
.step-progress-container {
  width: 100%;
  height: 10px;
  background-color: #ffffff;
	border: solid;
	border-radius: 5px;
}
.step-progress {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: #00416a;
  transition: 0.5s;
}
</style>
