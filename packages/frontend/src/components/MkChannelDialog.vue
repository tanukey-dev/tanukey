<template>
<MkModalWindow
	ref="dialog"
	:width="500"
	:height="300"
	:canClose="false"
	:withOkButton="true"
	:okButtonDisabled="false"
	@ok="ok()"
	@close="onClose"
	@closed="emit('closed')"
>
	<MkSpacer :marginMin="20" :marginMax="28">
		<Multiselect
			v-model="values"
			mode="tags"
			:options="channnelAsyncFind"
			:closeOnSelect="false"
			:searchable="true"
			:object="true"
			:resolveOnLoad="true"
			:delay="0"
			:minChars="1"
		/>
	</MkSpacer>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Multiselect from '@vueform/multiselect';
import MkModalWindow from '@/components/MkModalWindow.vue';
import * as os from '@/os';

const values = ref([]);

withDefaults(defineProps<{
	autoSet?: boolean;
	message?: string,
}>(), {
	autoSet: false,
	message: '',
});

const emit = defineEmits<{
	(ev: 'done', v: any): void;
	(ev: 'closed'): void;
	(ev: 'cancelled'): void;
}>();

const dialog = $shallowRef<InstanceType<typeof MkModalWindow>>();

function onClose() {
	emit('cancelled');
	if (dialog) dialog.close();
}

function ok() {
	emit('done', values.value);
	if (dialog) dialog.close();
}

async function channnelAsyncFind(query) {
	let chs = await os.api('channels/search', {
		query: query === null ? '' : query.trim(),
		type: 'nameOnly',
	});
	return chs.map(c => { return { value: c.id, label: c.name };});
}

</script>

<style src="@vueform/multiselect/themes/default.css"></style>
