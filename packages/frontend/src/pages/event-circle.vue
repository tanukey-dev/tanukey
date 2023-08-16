<template>
<KeepAlive>
	<MkStickyContainer>
		<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
		<MkSpacer :contentMax="700" :class="$style.main">
			<div v-if="event && circle && eventCircle && tab === 'overview'" class="_gaps">
				<div v-if="event.name" :class="$style.name">
					<Mfm :text="event.name" :isNote="false" :i="$i"/>
				</div>
				<div v-if="circle.name" :class="$style.name">
					<Mfm :text="circle.name" :isNote="false" :i="$i"/>
				</div>
				<div class="_panel" :class="$style.bannerContainer">
					<div :style="{ backgroundImage: eventCircle.circleImageUrl ? `url(${eventCircle.circleImageUrl})` : null }" :class="$style.banner">
						<!-- <div :class="$style.bannerStatus"></div> -->
						<div :class="$style.bannerFade"></div>
					</div>
					<div v-if="eventCircle.description" :class="$style.description">
						<Mfm :text="eventCircle.description" :isNote="false" :i="$i"/>
					</div>
				</div>
			</div>
		</MkSpacer>
		<template #footer>
			<div :class="$style.footer">
			</div>
		</template>
	</MkStickyContainer>
</KeepAlive>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import * as misskey from 'misskey-js';
import * as os from '@/os';
import { useRouter } from '@/router';
import { $i, iAmModerator } from '@/account';
import { i18n } from '@/i18n';
import { definePageMetadata } from '@/scripts/page-metadata';
import { url } from '@/config';
import MkButton from '@/components/MkButton.vue';
import MkEventCirclePreview from '@/components/MkEventCirclePreview.vue';
import MkPagination from '@/components/MkPagination.vue';

const router = useRouter();

const props = defineProps<{
	eventId: string;
	eventCircleId: string;
}>();

let tab = $ref('overview');
let event = $ref<null | misskey.entities.Channel>(null);
let eventCircle = $ref<null | misskey.entities.Channel>(null);
let circle = $ref<null | misskey.entities.Channel>(null);

watch(() => props.eventId, async () => {
	event = await os.api('events/show', {
		eventId: props.eventId,
	});
}, { immediate: true });

watch(() => props.eventCircleId, async () => {
	eventCircle = await os.api('eventCircles/show', {
		eventCircleId: props.eventCircleId,
	});
	
	circle = await os.api('circles/show', {
		circleId: eventCircle.circleId,
	});
}, { immediate: true });

function edit() {
	router.push(`/events/${event.id}/${props.eventCircleId}/edit`);
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
}]);

definePageMetadata(computed(() => event ? {
	title: event.name + '(' + (circle?.name ?? '') + ')',
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
	position: relative;
	height: 200px;
	background-position: center;
	background-size: cover;
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
