<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="800">
		<div ref="rootEl">
			<div v-if="queue > 0" :class="$style.new"><button class="_buttonPrimary" :class="$style.newButton" @click="top()">{{ i18n.ts.newNoteRecived }}</button></div>
			<div :class="$style.tl">
				<MkTimeline
					ref="tlEl" :key="listId + withRenotes + onlyFiles"
					src="list"
					:list="listId"
					:withRenotes="withRenotes"
					:onlyFiles="onlyFiles"
					:sound="true"
					@queue="queueUpdated"
				/>
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import MkTimeline from '@/components/MkTimeline.vue';
import { scroll } from '@/scripts/scroll.js';
import * as os from '@/os.js';
import { useRouter } from '@/router.js';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { i18n } from '@/i18n.js';

const router = useRouter();

const props = defineProps<{
	listId: string;
}>();

let list = $ref(null);
let queue = $ref(0);
let tlEl = $shallowRef<InstanceType<typeof MkTimeline>>();
let rootEl = $shallowRef<HTMLElement>();

const withRenotes = $ref(true);
const onlyFiles = $ref(false);

watch(() => props.listId, async () => {
	list = await os.api('users/lists/show', {
		listId: props.listId,
	});
}, { immediate: true });

function queueUpdated(q) {
	queue = q;
}

function top() {
	scroll(rootEl, { top: 0 });
}

function settings() {
	router.push(`/my/lists/${props.listId}`);
}

const headerActions = $computed(() => list ? [{
	icon: 'ti ti-settings',
	text: i18n.ts.settings,
	handler: settings,
},
{
	icon: 'ti ti-dots',
	text: i18n.ts.options,
	handler: (ev) => {
		os.popupMenu([{
			type: 'switch',
			text: i18n.ts.showRenotes,
			icon: 'ti ti-repeat',
			ref: $$(withRenotes),
		}, {
			type: 'switch',
			text: i18n.ts.fileAttachedOnly,
			icon: 'ti ti-photo',
			ref: $$(onlyFiles),
		}], ev.currentTarget ?? ev.target);
	},
}] : []);

const headerTabs = $computed(() => []);

definePageMetadata(computed(() => list ? {
	title: list.name,
	icon: 'ti ti-list',
} : null));
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
}

.newButton {
	display: block;
	margin: var(--margin) auto 0 auto;
	padding: 8px 16px;
	border-radius: 32px;
}

.tl {
	background: var(--bg);
	border-radius: var(--radius);
	overflow: clip;
}
</style>
