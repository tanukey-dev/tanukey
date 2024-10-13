<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader :actions="headerActions" :tabs="headerTabs" />
		</template>
		<MkSpacer :contentMax="700">
			<div v-if="circleId == null || circle != null" class="_gaps_m">
				<div>
					<MkButton v-if="profileImageId == null" @click="setBannerImage"><i class="ti ti-plus"></i> {{
						i18n.ts._circle.setBanner }}</MkButton>
					<div v-else-if="profileImageUrl">
						<img :src="profileImageUrl" style="width: 100%;" />
						<MkButton @click="removeBannerImage()"><i class="ti ti-trash"></i> {{
							i18n.ts._circle.removeBanner }}
						</MkButton>
					</div>
				</div>

				<MkInput v-model="name">
					<template #label>{{ i18n.ts.name }}</template>
				</MkInput>

				<MkTextarea v-model="description">
					<template #label>{{ i18n.ts.description }}</template>
				</MkTextarea>

				<MkSelect v-model="pageId">
					<template #label>{{ i18n.ts._circle.embededPage }}</template>
					<option v-for="page in pages" :key="page.id" :value="page.id">{{ page.title }}</option>
				</MkSelect>

				<div class="_buttons">
					<MkButton primary @click="save()"><i class="ti ti-device-floppy"></i> {{ circleId ? i18n.ts.save :
						i18n.ts.create }}</MkButton>
					<MkButton v-if="circleId" danger @click="archive()"><i class="ti ti-trash"></i> {{ i18n.ts.archive
						}}
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
import { selectFile } from "@/scripts/select-file";
import * as os from "@/os";
import { router } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { i18n } from "@/i18n";

const props = defineProps<{
	circleId?: string;
}>();

let circle = $ref(null);
let name = $ref(null);
let description = $ref(null);
let pageId = $ref(null);
let pages = $ref(null);
let profileImageUrl = $ref<string | null>(null);
let profileImageId = $ref<string | null>(null);

watch(
	() => profileImageId,
	async () => {
		if (profileImageId == null) {
			profileImageUrl = null;
		} else {
			profileImageUrl = (
				await os.api("drive/files/show", {
					fileId: profileImageId,
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
	if (props.circleId == null) return;

	circle = await os.api("circles/show", {
		circleId: props.circleId,
	});

	name = circle.name;
	description = circle.description;
	profileImageId = circle.profileImageId;
	profileImageUrl = circle.profileImageUrl;
	pageId = circle.pageId;
}

fetchEvent();

function save() {
	const params = {
		name: name,
		description: description,
		profileImageId: profileImageId,
		pageId: pageId,
	};

	if (props.circleId) {
		params.circleId = props.circleId;
		os.api("circles/update", params).then((u) => {
			os.success();
		});
	} else {
		os.api("circles/create", params).then((created) => {
			os.success();
			router.push(`/secure/circles/${created.id}`);
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

	os.api("circles/update", {
		circleId: props.circleId,
		isArchived: true,
	}).then(() => {
		os.success();
		router.push("/secure/circles");
		location.reload();
	});
}

function setBannerImage(evt) {
	selectFile(evt.currentTarget ?? evt.target, null).then((file) => {
		profileImageId = file.id;
	});
}

function removeBannerImage() {
	profileImageId = null;
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata(
	computed(() =>
		props.circleId
			? {
				title: i18n.ts._circle.edit,
				icon: "ti ti-circles-relation",
			}
			: {
				title: i18n.ts._circle.create,
				icon: "ti ti-circles-relation",
			},
	),
);
</script>

<style lang="scss" module></style>
