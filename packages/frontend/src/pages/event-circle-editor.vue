<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader :actions="headerActions" :tabs="headerTabs" />
		</template>
		<MkSpacer :contentMax="700">
			<div :class="$style.eventName">{{ i18n.ts.event }}: {{ eventName }}</div>
			<div v-if="eventCircleId == null || eventCircle != null" class="_gaps_m">
				<MkSelect v-model="circleId">
					<template #label>{{ i18n.ts.circle }}</template>
					<option v-for="circle in circles" :key="circle.id" :value="circle.id">{{ circle.name }}</option>
				</MkSelect>

				<MkTextarea v-model="description">
					<template #label>{{ i18n.ts.description }}</template>
				</MkTextarea>

				<MkSelect v-model="pageId">
					<template #label>{{ i18n.ts._eventCircle.embededPage }}</template>
					<option v-for="page in pages" :key="page.id" :value="page.id">{{ page.title }}</option>
				</MkSelect>

				<div class="_buttons">
					<MkButton primary @click="save()"><i class="ti ti-device-floppy"></i> {{ eventId ? i18n.ts.save :
						i18n.ts.create }}</MkButton>
					<MkButton v-if="eventCircleId" danger @click="archive()"><i class="ti ti-trash"></i> {{
						i18n.ts.archive }}
					</MkButton>
				</div>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import MkTextarea from "@/components/MkTextarea.vue";
import MkButton from "@/components/MkButton.vue";
import MkSelect from "@/components/MkSelect.vue";
import { selectFile } from "@/scripts/select-file";
import * as os from "@/os";
import { useRouter } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import { $i } from "@/account";

const router = useRouter();

const props = defineProps<{
	eventId?: string;
	eventCircleId?: string;
}>();

let event = $ref(null);
let eventCircle = $ref(null);
let circleId = $ref(null);
let circles = $ref([]);
let eventName = $ref(null);
let description = $ref(null);
let pageId = $ref(null);
let pages = $ref(null);

async function fetchPages() {
	pages = await os.api("i/pages");
}

fetchPages();

async function fetchCircles() {
	circles = await os.api("circles/show", {
		userId: $i?.id,
	});
}

fetchCircles();

async function fetchEvent() {
	if (props.eventId == null) return;

	event = await os.api("events/show", {
		eventId: props.eventId,
	});

	eventName = event.name;
}

fetchEvent();

async function fetchEventCircle() {
	if (props.eventCircleId == null) return;

	eventCircle = await os.api("eventCircles/show", {
		eventCircleId: props.eventCircleId,
	});

	circleId = eventCircle.circleId;
	description = eventCircle.description;
	pageId = eventCircle.pageId;
}

fetchEventCircle();

function save() {
	const params = {
		eventId: event.id,
		circleId: circleId,
		description: description,
		pageId: pageId,
	};

	if (props.eventCircleId) {
		params.eventCircleId = props.eventCircleId;
		os.api("eventCircles/update", params).then((u) => {
			os.success();
		});
	} else {
		os.api("eventCircles/create", params).then((created) => {
			os.success();
			router.push(`/secure/events/${props.eventId}/${created.id}`);
		});
	}
}

async function archive() {
	const { canceled } = await os.confirm({
		type: "warning",
		title: i18n.ts.archiveConfirmTitle,
		text: i18n.ts.archiveConfirmDescription,
	});

	if (canceled) return;

	os.api("eventCircles/update", {
		eventCircleId: props.eventCircleId,
		isArchived: true,
	}).then(() => {
		os.success();
		router.push(`/secure/events/${props.eventId}`);
		location.reload();
	});
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata(
	computed(() =>
		props.eventId
			? {
				title: i18n.ts._eventCircle.edit,
				icon: "ti ti-calendar-event",
			}
			: {
				title: i18n.ts._eventCircle.create,
				icon: "ti ti-calendar-event",
			},
	),
);
</script>

<style lang="scss" module>
.eventName {
	margin-bottom: 20px;
}
</style>
