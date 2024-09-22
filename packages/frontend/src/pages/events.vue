<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700">
		<div v-if="tab === 'calender'">
			<FullCalendar ref="fullCalendar" defaultView="dayGridMonth" :options="calendarOptions"/>
		</div>
		<div v-if="tab === 'search'">
			<div class="_gaps">
				<MkInput v-model="searchQuery" :large="true" :autofocus="true" type="search">
					<template #prefix><i class="ti ti-search"></i></template>
				</MkInput>
				<MkRadios v-model="searchType" @update:modelValue="search()">
					<option value="nameAndDescription">{{ i18n.ts._channel.nameAndDescription }}</option>
					<option value="nameOnly">{{ i18n.ts._channel.nameOnly }}</option>
				</MkRadios>
				<MkButton large primary gradate rounded @click="search">{{ i18n.ts.search }}</MkButton>
			</div>

			<MkFoldableSection v-if="eventPagination">
				<template #header>{{ i18n.ts.searchResult }}</template>
				<MkEventList :key="key" :pagination="eventPagination"/>
			</MkFoldableSection>
		</div>
		<div v-else-if="tab === 'owned'">
			<MkButton class="new" @click="create()"><i class="ti ti-plus"></i></MkButton>
			<MkEventList :key="key" :pagination="ownedPagination"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import MkEventList from "@/components/MkEventList.vue";
import MkInput from "@/components/MkInput.vue";
import MkRadios from "@/components/MkRadios.vue";
import MkButton from "@/components/MkButton.vue";
import MkFoldableSection from "@/components/MkFoldableSection.vue";
import * as os from "@/os";
import { useRouter } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";
import { miLocalStorage } from "@/local-storage";

const router = useRouter();

const props = defineProps<{
	query: string;
	type?: string;
}>();

let key = $ref("");
let tab = $ref("calender");
let searchQuery = $ref("");
let searchType = $ref("nameAndDescription");
let eventPagination = $ref();
const lang = ref(miLocalStorage.getItem("lang"));
const fullCalendar = ref();

onMounted(async () => {
	searchQuery = props.query ?? "";
	searchType = props.type ?? "nameAndDescription";
	const evs = await os.api("events/show", {
		time: new Date().getTime(),
	});

	let calendarApi = fullCalendar.value.getApi();

	evs.forEach((ev) => {
		calendarApi.addEvent({
			id: ev.id,
			title: ev.name,
			start: new Date(ev.startsAt),
			end: new Date(ev.expiresAt),
		});
	});
});

const calendarOptions = $ref({
	plugins: [dayGridPlugin],
	initialView: "dayGridMonth",
	locale: lang.value,
	dayCellContent: (e) => {
		// X日表記の'日'を除去
		return e.dayNumberText.replace("日", "");
	},
	eventClick: (info) => {
		router.push("/events/" + info.event.id);
	},
	events: [],
});

const ownedPagination = {
	endpoint: "events/owned" as const,
	limit: 10,
};

async function search() {
	const query = searchQuery.toString().trim();

	if (query == null) return;

	const type = searchType.toString().trim();

	eventPagination = {
		endpoint: "events/search",
		limit: 10,
		params: {
			query: searchQuery,
			type: type,
		},
	};

	key = query + type;
}

function create() {
	router.push("/events/new");
}

const headerActions = $computed(() => [
	{
		icon: "ti ti-plus",
		text: i18n.ts.create,
		handler: create,
	},
]);

const headerTabs = $computed(() => [
	{
		key: "search",
		title: i18n.ts._event.search,
		icon: "ti ti-search",
	},
	{
		key: "calender",
		title: i18n.ts._event.calender,
		icon: "ti ti-calendar",
	},
	{
		key: "owned",
		title: i18n.ts._event.owned,
		icon: "ti ti-edit",
	},
]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.event,
		icon: "ti ti-calendar-event",
	})),
);
</script>
