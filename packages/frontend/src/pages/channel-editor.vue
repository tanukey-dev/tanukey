<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader :actions="headerActions" :tabs="headerTabs" />
		</template>
		<MkSpacer :contentMax="700">
			<div v-if="channelId == null || channel != null" class="_gaps_m">
				<MkInput v-model="name">
					<template #label>{{ i18n.ts.name }}</template>
				</MkInput>

				<MkTextarea v-model="description">
					<template #label>{{ i18n.ts.description }}</template>
				</MkTextarea>

				<MkColorInput v-model="color">
					<template #label>{{ i18n.ts.color }}</template>
				</MkColorInput>

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

				<MkSwitch v-model="isPrivate" :disabled="!$i.policies.canCreatePrivateChannel">
					{{ i18n.ts._channel.isPrivate }}
				</MkSwitch>

				<MkFolder v-if="isPrivate" :defaultOpen="true">
					<template #label>{{ i18n.ts._channel.privateUserIds }}</template>

					<div class="_gaps">
						<Multiselect v-model="privateUserIds" mode="tags" :options="userAsyncFind"
							:closeOnSelect="false" :searchable="true" :object="true" :resolveOnLoad="true" :delay="0"
							:minChars="1" />
					</div>
				</MkFolder>

				<MkInput v-model="tags">
					<template #label>{{ i18n.ts.channelTagsSetting }}</template>
				</MkInput>

				<MkSwitch v-model="federation" :disabled="isPrivate">
					{{ i18n.ts.channelFederation }}
				</MkSwitch>

				<MkSwitch v-model="searchable" :disabled="federation || isPrivate">
					{{ i18n.ts.channelSearchable }}
				</MkSwitch>

				<MkSwitch v-model="isNoteCollapsed">
					{{ i18n.ts.isNoteCollapsed }}
				</MkSwitch>

				<MkFolder :defaultOpen="true">
					<template #label>{{ i18n.ts.pinnedNotes }}</template>

					<div class="_gaps">
						<MkButton primary rounded @click="addPinnedNote()"><i class="ti ti-plus"></i></MkButton>

						<Sortable v-model="pinnedNotes" itemKey="id" :handle="'.' + $style.pinnedNoteHandle"
							:animation="150">
							<template #item="{ element, index }">
								<div :class="$style.pinnedNote">
									<button class="_button" :class="$style.pinnedNoteHandle"><i
											class="ti ti-menu"></i></button>
									{{ element.id }}
									<button class="_button" :class="$style.pinnedNoteRemove"
										@click="removePinnedNote(index)"><i class="ti ti-x"></i></button>
								</div>
							</template>
						</Sortable>
					</div>
				</MkFolder>

				<MkFolder :defaultOpen="true">
					<template #label>{{ i18n.ts._channel.moderatorUserIds }}</template>

					<div class="_gaps">
						<Multiselect v-model="moderatorUserIds" mode="tags" :options="userAsyncFind"
							:closeOnSelect="false" :searchable="true" :object="true" :resolveOnLoad="true" :delay="0"
							:minChars="1" />
					</div>
				</MkFolder>

				<MkInput v-model="antennaId">
					<template #label>{{ i18n.ts._channel.antenna }}</template>
				</MkInput>

				<div class="_buttons">
					<MkButton primary @click="save()"><i class="ti ti-device-floppy"></i> {{ channelId ? i18n.ts.save :
						i18n.ts.create }}</MkButton>
					<MkButton v-if="channelId" danger @click="archive()"><i class="ti ti-trash"></i> {{ i18n.ts.archive
						}}
					</MkButton>
				</div>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { $i } from "@/account";
import MkButton from "@/components/MkButton.vue";
import MkColorInput from "@/components/MkColorInput.vue";
import MkFolder from "@/components/MkFolder.vue";
import MkInput from "@/components/MkInput.vue";
import MkSwitch from "@/components/MkSwitch.vue";
import MkTextarea from "@/components/MkTextarea.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";
import { useRouter } from "@/router";
import { definePageMetadata } from "@/scripts/page-metadata";
import { selectFile } from "@/scripts/select-file";
import Multiselect from "@vueform/multiselect";
import { computed, defineAsyncComponent, onBeforeMount, ref, watch } from "vue";

const Sortable = defineAsyncComponent(() =>
	import("vuedraggable").then((x) => x.default),
);

const router = useRouter();

const props = defineProps<{
	channelId?: string;
}>();

let channel = $ref(null);
let name = $ref(null);
let tags = $ref("");
let description = $ref(null);
let bannerUrl = $ref<string | null>(null);
let bannerId = $ref<string | null>(null);
const color = ref("#000");
const federation = ref(false);
const searchable = ref(true);
const isNoteCollapsed = ref(true);
const isPrivate = ref(false);
const antennaId = ref<string | null>(null);
const privateUserIds = ref<{ value: string; label: string }[]>([]);
const moderatorUserIds = ref<{ value: string; label: string }[]>([]);
const pinnedNotes = ref([]);

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

watch(federation, () => {
	if (federation.value) {
		searchable.value = true;
	}
});

watch(isPrivate, () => {
	if (isPrivate.value) {
		searchable.value = false;
		federation.value = false;
	}
});

async function fetchChannel() {
	if (props.channelId == null) return;

	channel = await os.api("channels/show", {
		channelId: props.channelId,
	});

	name = channel.name;
	description = channel.description;
	bannerId = channel.bannerId;
	bannerUrl = channel.bannerUrl;
	federation.value = channel.federation;
	searchable.value = channel.federation ? true : channel.searchable;
	isNoteCollapsed.value = channel.isNoteCollapsed;
	isPrivate.value = channel.isPrivate;
	tags = channel.tags.join(" ");
	antennaId.value = channel.antennaId;

	const pusers = await os.api("users/show", {
		userIds: channel.privateUserIds,
	});
	if (pusers) {
		let tmp: any[] = [];
		for (let puser of pusers) {
			if (puser) {
				tmp.push({ value: puser.id, label: puser.username });
			}
		}
		privateUserIds.value = tmp;
	}

	const musers = await os.api("users/show", {
		userIds: channel.moderatorUserIds,
	});
	if (musers) {
		let tmp: any[] = [];
		for (let puser of musers) {
			if (puser) {
				tmp.push({ value: puser.id, label: puser.username });
			}
		}
		moderatorUserIds.value = tmp;
	}

	pinnedNotes.value = channel.pinnedNoteIds.map((id) => ({
		id,
	}));
	color.value = channel.color;
}

onBeforeMount(() => {
	fetchChannel();
})

async function addPinnedNote() {
	const { canceled, result: value } = await os.inputText({
		title: i18n.ts.noteIdOrUrl,
	});
	if (canceled) return;
	const note = await os.apiWithDialog("notes/show", {
		noteId: value.includes("/") ? value.split("/").pop() : value,
	});
	pinnedNotes.value = [
		{
			id: note.id,
		},
		...pinnedNotes.value,
	];
}

function removePinnedNote(index: number) {
	pinnedNotes.value.splice(index, 1);
}

function save() {
	const params = {
		name: name,
		description: description,
		bannerId: bannerId,
		pinnedNoteIds: pinnedNotes.value.map((x) => x.id),
		federation: federation.value,
		searchable: federation.value ? true : searchable.value,
		isNoteCollapsed: isNoteCollapsed.value,
		isPrivate: isPrivate.value,
		privateUserIds: privateUserIds.value.map((v) => v.value),
		moderatorUserIds: moderatorUserIds.value.map((v) => v.value),
		color: color.value,
		tags: tags.trim() === "" ? [] : tags.replace("#", "").split(/\s+/),
		antennaId: antennaId.value ?? null,
	};

	if (props.channelId) {
		params.channelId = props.channelId;
		os.api("channels/update", params).then((u) => {
			os.success();
		});
	} else {
		os.api("channels/create", params).then((created) => {
			os.success();
			router.push(`/secure/channels/${created.id}`);
		});
	}
}

async function archive() {
	const { canceled } = await os.confirm({
		type: "warning",
		title: i18n.t("channelArchiveConfirmTitle", { name: name }),
		text: i18n.ts.channelArchiveConfirmDescription,
	});

	if (canceled) return;

	os.api("channels/update", {
		channelId: props.channelId,
		isArchived: true,
	}).then(() => {
		os.success();
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
		props.channelId
			? {
				title: i18n.ts._channel.edit,
				icon: "ti ti-device-tv",
			}
			: {
				title: i18n.ts._channel.create,
				icon: "ti ti-device-tv",
			},
	),
);

async function userAsyncFind(query) {
	let chs = await os.api("users/search", {
		query: query === null ? "" : query.trim(),
		origin: "local",
		detail: false,
	});
	return chs?.map((c) => {
		return { value: c.id, label: c.username };
	});
}
</script>

<style lang="scss" module>
.pinnedNote {
	position: relative;
	display: block;
	line-height: 2.85rem;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	color: var(--navFg);
}

.pinnedNoteRemove {
	position: absolute;
	z-index: 10000;
	width: 32px;
	height: 32px;
	color: #ff2a2a;
	right: 8px;
	opacity: 0.8;
}

.pinnedNoteHandle {
	cursor: move;
	width: 32px;
	height: 32px;
	margin: 0 8px;
	opacity: 0.5;
}
</style>

<style src="@vueform/multiselect/themes/default.css"></style>
