<template>
<div class="pxhvhrfw">
	<MkTabButton v-for="tab in tabs" :key="tab.value" :tab="tab" :active="isActive(tab)" @click="onClick"/>
</div>
</template>

<script lang="ts" setup>
import MkTabButton from '@/components/MkTabButton.vue';

const props = defineProps<{
	modelValue: string|null,
	tabs: Array<{ value: string, label: string }>,
}>();

// eslint-disable-next-line id-denylist
const emits = defineEmits<{(e: 'update:modelValue', text: string): void}>();

const isActive = (tab: any): boolean => {
	return tab.value === props.modelValue;
};

const onClick = (value: string): void => {
	emits('update:modelValue', value);
};

</script>

<style lang="scss">
.pxhvhrfw {
	display: flex;
	font-size: 90%;

	> button {
		flex: 1;
		padding: 10px 8px;
		border-radius: 999px;

		&:disabled {
			opacity: 1 !important;
			cursor: default;
		}

		&.active {
			color: var(--accent);
			background: var(--accentedBg);
		}

		&:not(.active):hover {
			color: var(--fgHighlighted);
			background: var(--panelHighlight);
		}

		&:not(:first-child) {
			margin-left: 8px;
		}

		> .icon {
			margin-right: 6px;
		}
	}
}

@container (max-width: 500px) {
	.pxhvhrfw {
		font-size: 80%;

		> button {
			padding: 11px 8px;
		}
	}
}
</style>
