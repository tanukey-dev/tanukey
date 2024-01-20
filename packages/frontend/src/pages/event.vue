<template>
<KeepAlive>
	<MkStickyContainer>
		<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
		<MkSpacer :contentMax="700" :class="$style.main">
			<div v-if="event && tab === 'overview'" class="_gaps">
				<template v-if="page">
					<XPage :page="page"/>
				</template>
			</div>
			<div v-if="tab === 'eventCircles'">
				<MkButton class="new" @click="joinEvent()"><i class="ti ti-plus"></i></MkButton>
				<MkEventCircleList :pagination="eventCirclePagination"/>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</KeepAlive>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import * as misskey from 'misskey-js';
import * as os from '@/os';
import XPage from '@/components/page/page.vue';
import { useRouter } from '@/router';
import { $i, iAmModerator } from '@/account';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import { url } from '@/config';
import MkButton from '@/components/MkButton.vue';
import MkEventCircleList from '@/components/MkEventCircleList.vue';

const router = useRouter();

const props = defineProps<{
	eventId: string;
}>();

let tab = $ref('overview');
let event = $ref(null);
let circles = $ref([]);
let page = $ref(null);

watch(() => props.eventId, async () => {
	event = await os.api('events/show', {
		eventId: props.eventId,
	});

	circles = await os.api('eventCircles/show', {
		eventId: props.eventId,
	});

	page = await os.api('pages/show', {
		pageId: event.pageId,
	});
}, { immediate: true });

function edit() {
	router.push(`/events/${event.id}/edit`);
}

const eventCirclePagination = {
	endpoint: 'eventCircles/show' as const,
	params: {
		eventId: props.eventId,
	},
	limit: 10,
};

function joinEvent() {
	router.push(`/events/${event.id}/join`);
}

const headerActions = $computed(() => {
	if (event && event.userId) {
		const share = {
			icon: 'ti ti-share',
			text: i18n.ts.share,
			handler: async (): Promise<void> => {
				navigator.share({
					title: event.name,
					text: event.description,
					url: `${url}/events/${event.id}`,
				});
			},
		};

		const canEdit = $i && $i.id === event.userId || iAmModerator;
		return canEdit ? [share, {
			icon: 'ti ti-settings',
			text: i18n.ts.edit,
			handler: edit,
		}] : [share];
	} else {
		return null;
	}
});

const headerTabs = $computed(() => [{
	key: 'overview',
	title: i18n.ts.overview,
	icon: 'ti ti-info-circle',
}, {
	key: 'eventCircles',
	title: i18n.ts.participatingCircles,
	icon: 'ti ti-circles-relation',
}]);

definePageMetadata(computed(() => event ? {
	title: event.name,
	icon: 'ti ti-calendar-event',
} : null));
</script>

<style lang="scss" module>
.main {
	min-height: calc(100cqh - (var(--stickyTop, 0px) + var(--stickyBottom, 0px)));
}

.footer {
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
	border-top: solid 0.5px var(--divider);
}

.bannerContainer {
	position: relative;
}

.subscribe {
	position: absolute;
	z-index: 1;
	top: 16px;
	left: 16px;
}

.favorite {
	position: absolute;
	z-index: 1;
	top: 16px;
	right: 16px;
}

.banner {
	display: flex;
	justify-content: center;
	width: auto;
	height: 300px;
}

.bannerName {
	font-size: 1.2em;
}

.bannerFade {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 64px;
	background: linear-gradient(0deg, var(--panel), var(--X15));
}

.bannerStatus {
	position: absolute;
	z-index: 1;
	bottom: 16px;
	right: 16px;
	padding: 8px 12px;
	font-size: 80%;
	background: rgba(0, 0, 0, 0.7);
	border-radius: 6px;
	color: #fff;
}

.description {
	padding: 16px;
}
</style>
