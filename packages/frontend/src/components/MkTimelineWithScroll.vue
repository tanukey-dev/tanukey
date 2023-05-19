<template>
<div v-if="queue > 0" :class="$style.new"><button class="_buttonPrimary" @click="top()">{{ i18n.ts.newNoteRecived }}</button></div>
<div :class="$style.tl">
	<MkTimeline
		ref="tlComponent"
		:key="src"
		:src="src"
		:channel="channel"
		:sound="true"
		@queue="queueUpdated"
	/>
</div>
</template>
<script lang="ts" setup>
import { watch } from 'vue';
import { i18n } from '@/i18n';
import MkTimeline from '@/components/MkTimeline.vue';
import { scrollToTop } from '@/scripts/scroll';

const props = defineProps<{
	src: string;
	list?: string;
	antenna?: string;
	channel?: string|null;
	role?: string;
	sound?: boolean;
}>();

const tlComponent = $shallowRef<InstanceType<typeof MkTimeline>>();

let queue = $ref(0);
let src = $ref(props.src);

watch ($$(src), () => queue = 0);

function queueUpdated(q: number): void {
	queue = q;
}

function top(): void {
	scrollToTop(null);
}
</script>

<style lang="scss" module>
.new {
	position: sticky;
	top: calc(var(--stickyTop, 0px) + 16px);
	z-index: 1000;
	width: 100%;
	margin: calc(-0.675em - 8px) 0;

	&:first-child {
		margin-top: calc(-0.675em - 8px - var(--margin));
	}

	> button {
		display: block;
		margin: var(--margin) auto 0 auto;
		padding: 8px 16px;
		border-radius: 32px;
	}
}

.tl {
	background: var(--bg);
	border-radius: var(--radius);
	overflow: clip;
}
</style>
