<template>
<div v-if="queue > 0" :class="$style.new"><button class="_buttonPrimary" @click="top()">{{ i18n.ts.newNoteRecived }}</button></div>
<XTutorial v-if="$i && defaultStore.reactiveState.timelineTutorial.value != -1" class="_panel" style="margin-bottom: var(--margin);"/>
<MkPostForm v-if="defaultStore.reactiveState.showFixedPostForm.value" :class="$style.postForm" class="post-form _panel" fixed style="margin-bottom: var(--margin);"/>
<MkFoldableSection v-if="channel && channel.pinnedNotes?.length > 0">
	<template #header><i class="ti ti-pin ti-fw" style="margin-right: 0.5em;"></i>{{ i18n.ts.pinnedNotes }}</template>
	<div v-if="channel.pinnedNotes.length > 0" class="_gaps">
		<MkNote v-for="note in channel.pinnedNotes" :key="note.id" class="_panel" :note="note"/>
	</div>
</MkFoldableSection>
<div v-if="channel && channel.pinnedNotes?.length > 0" :class="$style.header">
	<div :class="$style.title"><div><i class="ti ti-timeline" style="margin-right: 0.5em;"></i>{{ i18n.ts.timeline }}</div></div>
	<div :class="$style.divider"></div>
</div>
<div ref="el" :class="$style.tl">
	<MkTimeline
		ref="tlComponent"
		:key="src"
		:src="src"
		:channel="channelId"
		:sound="true"
		@queue="queueUpdated"
	/>
</div>
</template>
<script lang="ts" setup>
import { defineAsyncComponent, watch, ref, onMounted, onBeforeMount } from 'vue';
import { i18n } from '@/i18n';
import * as os from '@/os';
import MkTimeline from '@/components/MkTimeline.vue';
import MkPostForm from '@/components/MkPostForm.vue';
import { defaultStore } from '@/store';
import { scrollToTop } from '@/scripts/scroll';
import { $i } from '@/account';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import MkNote from '@/components/MkNote.vue';

const props = defineProps<{
	src: string;
	list?: string;
	antenna?: string;
	channelId?: string|null;
	role?: string;
	sound?: boolean;
}>();

const XTutorial = defineAsyncComponent(() => import('@/pages/timeline.tutorial.vue'));
const tlComponent = $shallowRef<InstanceType<typeof MkTimeline>>();
const channel = ref<any>(null);
let el = $shallowRef<HTMLElement | undefined>(undefined);

let queue = $ref(0);
let src = $ref(props.src);

watch ($$(src), () => queue = 0);

onBeforeMount(async () => {
	if (props.channelId) {
		let ch = await os.api('channels/show', {
			channelId: props.channelId,
		});
		channel.value = ch;
	}
});

function queueUpdated(q: number): void {
	queue = q;
}

const top = () => {
	if (el) {
		scrollToTop(el as HTMLElement, { behavior: 'smooth' });
	}
};

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
.postForm {
	border-radius: var(--radius);
}

.tl {
	background: var(--bg);
	border-radius: var(--radius);
	overflow: clip;
}

.header {
	display: flex;
	position: relative;
	z-index: 10;
	position: sticky;
	top: var(--stickyTop, 0px);
	-webkit-backdrop-filter: var(--blur, blur(8px));
	backdrop-filter: var(--blur, blur(20px));
}
.divider {
	flex: 1;
	margin: auto;
	height: 1px;
	background: var(--divider);
}
.title {
	display: grid;
	place-content: center;
	margin: 0;
	padding: 12px 16px 12px 0;
}
</style>
