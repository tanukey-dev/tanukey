<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader :actions="headerActions" :tabs="headerTabs" />
		</template>
		<MkSpacer :contentMax="700">
			<div v-if="eventId == null || event != null" class="_gaps_m">
				<div>
					<MkButton v-if="bannerId == null" @click="setBannerImage"><i class="ti ti-plus"></i> {{
						i18n.ts._channel.setBanner }}</MkButton>
					<div v-else-if="bannerUrl">
						<img :src="bannerUrl" style="width: 100%;" />
						<MkButton @click="removeBannerImage()"><i class="ti ti-trash"></i> {{
							i18n.ts._channel.removeBanner }}
						</MkButton>
					</div>
				</div>

				<MkInput v-model="name">
					<template #label>{{ i18n.ts.name }}</template>
				</MkInput>

				<MkTextarea v-model="description">
					<template #label>{{ i18n.ts.description }}</template>
				</MkTextarea>

				<FormSplit>
					<MkInput v-model="startsAt" type="datetime-local">
						<template #label>{{ i18n.ts.startingperiod }}</template>
					</MkInput>
					<MkInput v-model="expiresAt" type="datetime-local">
						<template #label>{{ i18n.ts.expiration }}</template>
					</MkInput>
				</FormSplit>

				<MkSelect v-model="pageId">
					<template #label>{{ i18n.ts._event.embededPage }}</template>
					<option v-for="page in pages" :key="page.id" :value="page.id">{{ page.title }}</option>
				</MkSelect>

				<div class="_buttons">
					<MkButton primary @click="save()"><i class="ti ti-device-floppy"></i> {{ eventId ? i18n.ts.save :
						i18n.ts.create }}</MkButton>
					<MkButton v-if="eventId" danger @click="archive()"><i class="ti ti-trash"></i> {{ i18n.ts.archive }}
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
import MkInput from "@/components/MkInput.vue";
import MkSelect from "@/components/MkSelect.vue";
import FormSplit from "@/components/form/split.vue";
import { selectFile } from "@/scripts/select-file";
import * as os from "@/os";
import { router } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";

const props = defineProps<{
	eventId?: string;
}>();

let event = $ref(null);
let name = $ref(null);
let description = $ref(null);
let startsAt = $ref(null);
let expiresAt = $ref(null);
let pageId = $ref(null);
let pages = $ref(null);
let bannerUrl = $ref<string | null>(null);
let bannerId = $ref<string | null>(null);

watch(
	() => bannerId,
	async () => {
		if (bannerId == null) {
			bannerUrl = null;
		} else {
			bannerUrl = (
				await os.api("drive/files/show", {
					fileId: bannerId,
				})
			).url;
		}
	},
);

async function fetchPages() {
	pages = await os.api("i/pages");
}

fetchPages();

async function fetchEvent() {
	if (props.eventId == null) return;

	event = await os.api("events/show", {
		eventId: props.eventId,
	});

	name = event.name;
	description = event.description;
	bannerId = event.bannerId;
	bannerUrl = event.bannerUrl;
	startsAt = event.startsAt;
	expiresAt = event.expiresAt;
	pageId = event.pageId;
}

fetchEvent();

function save() {
	const params = {
		name: name,
		description: description,
		bannerId: bannerId,
		startsAt: new Date(startsAt).getTime(),
		expiresAt: new Date(expiresAt).getTime(),
		pageId: pageId,
	};

	if (props.eventId) {
		params.eventId = props.eventId;
		os.api("events/update", params).then((u) => {
			os.success();
		});
	} else {
		os.api("events/create", params).then((created) => {
			os.success();
			router.push(`/secure/events/${created.id}`);
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

	os.api("events/update", {
		eventId: props.eventId,
		isArchived: true,
	}).then(() => {
		os.success();
		router.push("/events");
		location.reload();
	});
}

function setBannerImage(evt) {
	selectFile(evt.currentTarget ?? evt.target, null).then((file) => {
		bannerId = file.id;
	});
}

function removeBannerImage() {
	bannerId = null;
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata(
	computed(() =>
		props.eventId
			? {
				title: i18n.ts._event.edit,
				icon: "ti ti-calendar-event",
			}
			: {
				title: i18n.ts._event.create,
				icon: "ti ti-calendar-event",
			},
	),
);
</script>

<style lang="scss" module></style>
