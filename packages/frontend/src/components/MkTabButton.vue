<template>
<button
	:key="tab.value"
	:value="tab.value"
	:class="isActice()"
	@click="onClick(tab.value)"
>
	{{ tab.label }}
</button>
</template>

<script lang="ts" setup>
import '@/directives/click-anime.ts';

const props = defineProps<{
	active: boolean,
	tab: { value: string, label: string }
}>();

const emits = defineEmits<{
	(ev: 'click', value: string): void;
}>();

const isActice = (): string => {
	return '_button' + (props.active ? ' active' : '');
};

const onClick = (value: string): void => {
	emits('click', value);
};
</script>
