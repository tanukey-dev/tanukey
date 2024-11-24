<template>
	<MkSpacer :contentMax="700">
		<div>
			<div class="_gaps_m">
				<MkInput v-model="name">
					<template #label>{{ i18n.ts.name }}</template>
				</MkInput>
				<MkSwitch v-model="isPublic">{{ i18n.ts.public }}</MkSwitch>
				<MkTextarea v-model="users">
					<template #label>{{ i18n.ts.users }}</template>
					<template #caption>
						{{ i18n.ts.antennaUsersDescription }}
						<button class="_textButton" @click="addUser">{{ i18n.ts.addUser }}</button>
					</template>
				</MkTextarea>
				<MkTextarea v-model="excludeUsers">
					<template #label>{{ i18n.ts.excludeUsers }}</template>
					<template #caption>
						{{ i18n.ts.antennaUsersDescription }}
						<button class="_textButton" @click="addExcludeUser">{{ i18n.ts.addUser }}</button>
					</template>
				</MkTextarea>
				<MkSwitch v-model="withReplies">{{ i18n.ts.withReplies }}</MkSwitch>
				<MkTextarea v-model="keywords">
					<template #label>{{ i18n.ts.antennaKeywords }}</template>
					<template #caption>{{ i18n.ts.antennaKeywordsDescription }}</template>
				</MkTextarea>
				<MkTextarea v-model="excludeKeywords">
					<template #label>{{ i18n.ts.antennaExcludeKeywords }}</template>
					<template #caption>{{ i18n.ts.antennaKeywordsDescription }}</template>
				</MkTextarea>
				<MkSwitch v-model="localOnly">{{ i18n.ts.localOnly }}</MkSwitch>
				<MkSwitch v-model="withFile">{{ i18n.ts.withFileAntenna }}</MkSwitch>
				<MkSwitch v-model="notify">{{ i18n.ts.notifyAntenna }}</MkSwitch>

				<MkFolder :defaultOpen="true">
					<template #label>{{ i18n.ts.pinnedAntennas }}</template>

					<div class="_gaps">
						<MkButton primary rounded @click="addPinnedAntenna()"><i class="ti ti-plus"></i></MkButton>

						<Sortable v-model="pinnedAntennas" itemKey="id" :handle="'.' + $style.pinnedAntennaHandle"
							:animation="150">
							<template #item="{ element, index }">
								<div :class="$style.pinnedAntenna">
									<button class="_button" :class="$style.pinnedAntennaHandle"><i
											class="ti ti-menu"></i></button>
									{{ element.id }}
									<button class="_button" :class="$style.pinnedAntennaRemove"
										@click="removePinnedAntenna(index)"><i class="ti ti-x"></i></button>
								</div>
							</template>
						</Sortable>
					</div>
				</MkFolder>
			</div>
			<div :class="$style.actions">
				<MkButton inline primary @click="saveAntenna()">
					<i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}
				</MkButton>
				<MkButton v-if="antenna?.id != null" inline danger @click="deleteAntenna()">
					<i class="ti ti-trash"></i> {{ i18n.ts.delete }}
				</MkButton>
			</div>
		</div>
	</MkSpacer>
</template>

<script lang="ts" setup>
import { watch, defineAsyncComponent } from "vue";
import * as Acct from "misskey-js/built/acct";
import MkButton from "@/components/MkButton.vue";
import MkInput from "@/components/MkInput.vue";
import MkTextarea from "@/components/MkTextarea.vue";
import MkSwitch from "@/components/MkSwitch.vue";
import MkFolder from "@/components/MkFolder.vue";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { useRoute } from 'vue-router';

const route = useRoute()

const Sortable = defineAsyncComponent(() =>
	import("vuedraggable").then((x) => x.default),
);

const emit = defineEmits<{
	(ev: "created"): void;
	(ev: "updated"): void;
	(ev: "deleted"): void;
}>();

let name: string = $ref();
let src: string = $ref();
let userListId: any = $ref();
let users: string = $ref();
let excludeUsers: string = $ref();
let keywords: string = $ref();
let excludeKeywords: string = $ref();
let caseSensitive: boolean = $ref();
let localOnly: boolean = $ref();
let withReplies: boolean = $ref();
let withFile: boolean = $ref();
let notify: boolean = $ref();
let isPublic: boolean = $ref();
let pinnedAntennas = $ref<{ id: string }[]>([]);
let antenna: any = $ref(null);

watch(() => route.params.antennaId, async (newId, oldId) => {
	antenna = await os.api("antennas/show", { antennaId: newId })
	name = antenna.name;
	src = antenna.src;
	userListId = antenna.userListId;
	users = antenna.users.join("\n");
	excludeUsers = antenna.excludeUsers.join("\n");
	keywords = antenna.keywords.map((x) => x.join(" ")).join("\n");
	excludeKeywords = antenna.excludeKeywords.map((x) => x.join(" ")).join("\n");
	caseSensitive = antenna.caseSensitive;
	localOnly = antenna.localOnly;
	withReplies = antenna.withReplies;
	withFile = antenna.withFile;
	notify = antenna.notify;
	isPublic = antenna.public;
	pinnedAntennas = antenna.compositeAntennaIds.map((x) => { return { id: x }; });
}, { immediate: true });

async function saveAntenna() {
	const antennaData = {
		name,
		src,
		userListId,
		withReplies,
		withFile,
		notify,
		caseSensitive,
		localOnly,
		public: isPublic,
		users: users
			.trim()
			.split("\n")
			.map((x) => x.trim()),
		excludeUsers: excludeUsers
			.trim()
			.split("\n")
			.map((x) => x.trim()),
		keywords: keywords
			.trim()
			.split("\n")
			.map((x) => x.trim().replace(/\s+/g, " ").split(" ")),
		excludeKeywords: excludeKeywords
			.trim()
			.split("\n")
			.map((x) => x.trim().replace(/\s+/g, " ").split(" ")),
		compositeAntennaIds: pinnedAntennas.map((x) => x.id),
	};

	if (route.params.antennaId == null) {
		await os.apiWithDialog("antennas/create", antennaData);
		emit("created");
	} else {
		antennaData["antennaId"] = route.params.antennaId;
		await os.apiWithDialog("antennas/update", antennaData);
		emit("updated");
	}
}

async function deleteAntenna() {
	const { canceled } = await os.confirm({
		type: "warning",
		text: i18n.t("removeAreYouSure", { x: antenna.name }),
	});
	if (canceled) return;

	await os.api("antennas/delete", {
		antennaId: antenna.id,
	});

	os.success();
	emit("deleted");
}

async function addPinnedAntenna() {
	const { canceled, result: value } = await os.inputText({
		title: i18n.ts.antennaIdOrUrl,
	});
	if (canceled) return;
	const antenna = await os.apiWithDialog("antennas/show", {
		antennaId: value.includes("/") ? value.split("/").pop() : value,
	});
	pinnedAntennas = [
		{
			id: antenna.id,
		},
		...pinnedAntennas,
	];
}

function removePinnedAntenna(index: number) {
	pinnedAntennas.splice(index, 1);
}

function addUser() {
	os.selectUser().then((user) => {
		users = users.trim();
		users += "\n@" + Acct.toString(user as any);
		users = users.trim();
	});
}

function addExcludeUser() {
	os.selectUser().then((user) => {
		excludeUsers = excludeUsers.trim();
		excludeUsers += "\n@" + Acct.toString(user as any);
		excludeUsers = excludeUsers.trim();
	});
}
</script>

<style lang="scss" module>
.actions {
	margin-top: 16px;
	padding: 24px 0;
	border-top: solid 0.5px var(--divider);
}

.pinnedAntenna {
	position: relative;
	display: block;
	line-height: 2.85rem;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	color: var(--navFg);
}

.pinnedAntennaRemove {
	position: absolute;
	z-index: 10000;
	width: 32px;
	height: 32px;
	color: #ff2a2a;
	right: 8px;
	opacity: 0.8;
}

.pinnedAntennaHandle {
	cursor: move;
	width: 32px;
	height: 32px;
	margin: 0 8px;
	opacity: 0.5;
}
</style>
