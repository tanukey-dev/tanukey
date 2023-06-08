<template>
<MkModal ref="modal" v-slot="{ type }" :zPriority="'high'" :src="src" @click="modal.close()" @closed="emit('closed')">
	<div class="_popup" :class="{ [$style.root]: true, [$style.asDrawer]: type === 'drawer' }">
		<template v-for="tab in tabs" :key="tab.key">
			<button class="_button" :class="[$style.item, { [$style.active]: tab.key === currentKey }]" data-index="1" @click="choose(tab.key)">
				<div :class="$style.icon"><i :class="tab.icon"></i></div>
				<div :class="$style.body">
					<span :class="$style.itemTitle">{{ tab.title }}</span>
				</div>
			</button>
		</template>
	</div>
</MkModal>
</template>

<script lang="ts" setup>
import { nextTick, ref } from 'vue';
import MkModal from '@/components/MkModal.vue';

const modal = $shallowRef<InstanceType<typeof MkModal>>();

const props = withDefaults(defineProps<{
	currentKey: string|null;
	tabs: { key: string, title: string, icon: string }[];
	src?: HTMLElement;
}>(), {
});

const emit = defineEmits<{
	(ev: 'changeKey', key: string|null): void;
	(ev: 'closed'): void;
}>();

let currentKey = ref<string|null>(props.currentKey);

function choose(key: string|null): void {
	currentKey.value = key;
	emit('changeKey', key);
	nextTick(() => {
		if (modal) modal.close();
	});
}
</script>

<style lang="scss" module>
.root {
	min-width: 240px;
	padding: 8px 0;

	&.asDrawer {
		padding: 12px 0 max(env(safe-area-inset-bottom, 0px), 12px) 0;
		width: 100%;
		border-radius: 24px;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0;

		.label {
			pointer-events: none;
			font-size: 12px;
			padding-bottom: 4px;
			opacity: 0.7;
		}

		.item {
			font-size: 14px;
			padding: 10px 24px;
		}
	}
}

.label {
	pointer-events: none;
	font-size: 10px;
	padding-bottom: 4px;
	opacity: 0.7;
}

.item {
	display: flex;
	padding: 8px 14px;
	font-size: 12px;
	text-align: left;
	width: 100%;
	box-sizing: border-box;

	&:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	&:active {
		background: rgba(0, 0, 0, 0.1);
	}

	&.active {
		color: var(--accent);
	}
}

.icon {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-right: 10px;
	width: 16px;
	top: 0;
	bottom: 0;
	margin-top: auto;
	margin-bottom: auto;
}

.body {
	flex: 1 1 auto;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.itemTitle {
	display: block;
	font-weight: bold;
}

.itemDescription {
	opacity: 0.6;
}
</style>
