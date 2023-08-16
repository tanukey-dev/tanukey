<template>
<MkStickyContainer>
	<template #header><MkPageHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700">
		<div v-if="eventId == null || event != null" class="_gaps_m">
			<MkInput v-model="name">
				<template #label>{{ i18n.ts.name }}</template>
			</MkInput>

			<MkTextarea v-model="description">
				<template #label>{{ i18n.ts.description }}</template>
			</MkTextarea>

			<div>
				<MkButton v-if="bannerId == null" @click="setBannerImage"><i class="ti ti-plus"></i> {{ i18n.ts._channel.setBanner }}</MkButton>
				<div v-else-if="bannerUrl">
					<img :src="bannerUrl" style="width: 100%;"/>
					<MkButton @click="removeBannerImage()"><i class="ti ti-trash"></i> {{ i18n.ts._channel.removeBanner }}</MkButton>
				</div>
			</div>

			<div class="_buttons">
				<MkButton primary @click="save()"><i class="ti ti-device-floppy"></i> {{ eventId ? i18n.ts.save : i18n.ts.create }}</MkButton>
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import { selectFile } from '@/scripts/select-file';
import * as os from '@/os';
import { useRouter } from '@/router';
import { definePageMetadata } from '@/scripts/page-metadata';
import { i18n } from '@/i18n';

const router = useRouter();

const props = defineProps<{
	eventId?: string;
}>();

let event = $ref(null);
let name = $ref(null);
let description = $ref(null);
let bannerUrl = $ref<string | null>(null);
let bannerId = $ref<string | null>(null);

watch(() => bannerId, async () => {
	if (bannerId == null) {
		bannerUrl = null;
	} else {
		bannerUrl = (await os.api('drive/files/show', {
			fileId: bannerId,
		})).url;
	}
});

async function fetchEvent() {
	if (props.eventId == null) return;

	event = await os.api('events/show', {
		eventId: props.eventId,
	});

	name = event.name;
	description = event.description;
	bannerId = event.bannerId;
	bannerUrl = event.bannerUrl;
}

fetchEvent();

function save() {
	const params = {
		name: name,
		description: description,
		bannerId: bannerId,
	};

	if (props.eventId) {
		params.eventId = props.eventId;
		os.api('events/update', params).then((u) => {
			os.success();
		});
	} else {
		os.api('events/create', params).then(created => {
			os.success();
			router.push(`/events/${created.id}`);
		});
	}
}

function setBannerImage(evt) {
	selectFile(evt.currentTarget ?? evt.target, null).then(file => {
		bannerId = file.id;
	});
}

function removeBannerImage() {
	bannerId = null;
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata(computed(() => props.eventId ? {
	title: i18n.ts._event.edit,
	icon: 'ti ti-calendar-event',
} : {
	title: i18n.ts._event.create,
	icon: 'ti ti-calendar-event',
}));

</script>

<style lang="scss" module>
</style>
