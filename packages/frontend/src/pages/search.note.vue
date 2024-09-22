<template>
<div class="_gaps">
	<div class="_gaps">
		<MkInput v-model="searchQuery" :large="true" :autofocus="true" type="search">
			<template #prefix><i class="ti ti-search"></i></template>
		</MkInput>
		<MkFolder :defaultOpen="optionOpen">
			<template #label>{{ i18n.ts.options }}</template>

			<MkFolder :class="$style.formContent" :defaultOpen="userOptionOpen">
				<template #label>{{ i18n.ts.specifyUser }}</template>
				<template v-if="user" #suffix>@{{ user.username }}</template>

				<div style="text-align: center;" class="_gaps">
					<div v-if="user">@{{ user.username }}</div>
					<div>
						<MkButton v-if="user == null" primary rounded inline @click="selectUser">{{ i18n.ts.selectUser }}</MkButton>
						<MkButton v-else danger rounded inline @click="user = null">{{ i18n.ts.remove }}</MkButton>
					</div>
				</div>
			</MkFolder>

			<FormSplit :class="$style.formContent">
				<MkInput v-model="createAtBegin" type="datetime-local">
					<template #label>{{ i18n.ts.startDate }}</template>
				</MkInput>
				<MkInput v-model="createAtEnd" type="datetime-local">
					<template #label>{{ i18n.ts.endDate }}</template>
				</MkInput>
			</FormSplit>

			<MkSwitch v-model="reverseOrder" :class="$style.formContent">
				{{ i18n.ts.olderOrder }}
			</MkSwitch>

			<MkSwitch v-model="hasFile" :class="$style.formContent">
				{{ i18n.ts.withFileAntenna }}
			</MkSwitch>
		</MkFolder>
		<MkRadios v-model="searchOrigin">
			<option value="local">{{ i18n.ts.local }}</option>
			<option value="remote">{{ i18n.ts.remote }}</option>
			<option value="combined">{{ i18n.ts.all }}</option>
		</MkRadios>
		<div>
			<MkButton large primary gradate rounded style="margin: 0 auto;" @click="search">{{ i18n.ts.search }}</MkButton>
		</div>
	</div>

	<MkFoldableSection v-if="notePagination">
		<template #header>{{ i18n.ts.searchResult }}</template>
		<MkNotes :key="key" :pagination="notePagination"/>
	</MkFoldableSection>
</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import MkNotes from "@/components/MkNotes.vue";
import MkInput from "@/components/MkInput.vue";
import MkRadios from "@/components/MkRadios.vue";
import MkButton from "@/components/MkButton.vue";
import MkSwitch from "@/components/MkSwitch.vue";
import FormSplit from "@/components/form/split.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";
import MkFoldableSection from "@/components/MkFoldableSection.vue";
import { useRouter } from "@/router";
import MkFolder from "@/components/MkFolder.vue";

const router = useRouter();

let key = $ref(0);
let searchQuery = ref("");
let searchOrigin = ref<string>("local");
let notePagination = $ref();
let user = ref<any>(null);
let createAtBegin = ref<any>(null);
let createAtEnd = ref<any>(null);
let reverseOrder = ref<any>(false);
let hasFile = ref<any>(false);
let optionOpen = ref(false);
let userOptionOpen = ref(false);

// ISO形式はTZがUTCになってしまうので、TZ分ずらして時間を初期化
const localTime = new Date();
const localTimeDiff = localTime.getTimezoneOffset() * 60 * 1000;

watch(searchQuery, () => {
	updateUrlParameter();
});
watch(searchOrigin, () => {
	updateUrlParameter();
});
watch(user, () => {
	updateUrlParameter();
});
watch(createAtBegin, () => {
	updateUrlParameter();
});
watch(createAtEnd, () => {
	updateUrlParameter();
});
watch(reverseOrder, () => {
	updateUrlParameter();
});
watch(hasFile, () => {
	updateUrlParameter();
});

function setSearchParams(searchParams, name, value): void {
	if (value) {
		searchParams.set(name, value);
	} else {
		searchParams.delete(name);
	}
}
function updateUrlParameter(): void {
	const searchParams = new URLSearchParams(window.location.search);
	setSearchParams(searchParams, "q", searchQuery.value);
	setSearchParams(searchParams, "origin", searchOrigin.value);
	setSearchParams(searchParams, "userId", user.value?.id);
	setSearchParams(searchParams, "createAtBegin", createAtBegin.value);
	setSearchParams(searchParams, "createAtEnd", createAtEnd.value);
	setSearchParams(searchParams, "reverseOrder", reverseOrder.value);
	setSearchParams(searchParams, "hasFile", hasFile.value);
	history.replaceState("", "", `?${searchParams.toString()}`);
}

async function loadUrlParameter() {
	const searchParams = new URLSearchParams(window.location.search);
	const query = searchParams.get("q");
	if (query) {
		searchQuery.value = query;
	}
	const origin = searchParams.get("origin");
	if (origin) {
		searchOrigin.value = origin;
	}
	const userId = searchParams.get("userId");
	if (userId) {
		user.value = await os
			.api("users/show", {
				userId: userId,
			})
			.catch(() => {
				user.value = null;
			});
		optionOpen.value = true;
		userOptionOpen.value = true;
	}
	const begin = searchParams.get("createAtBegin");
	if (begin) {
		createAtBegin.value = begin;
		optionOpen.value = true;
	}
	const end = searchParams.get("createAtEnd");
	if (end) {
		createAtEnd.value = end;
		optionOpen.value = true;
	}
	const _reverseOrder = searchParams.get("reverseOrder");
	if (_reverseOrder) {
		reverseOrder.value = _reverseOrder === "true";
		optionOpen.value = true;
	}
	const _hasFile = searchParams.get("hasFile");
	if (_hasFile) {
		hasFile.value = _hasFile === "true";
		optionOpen.value = true;
	}

	// クエリに指定がある場合は検索実行
	if (query) {
		search();
	}
}

await loadUrlParameter();

function selectUser() {
	os.selectUser().then((_user) => {
		user.value = _user;
	});
}

async function search() {
	const query = searchQuery.value.toString().trim();

	if (query.startsWith("https://")) {
		const promise = os.api("ap/show", {
			uri: query,
		});

		os.promiseDialog(promise, null, null, i18n.ts.fetchingAsApObject);

		const res = await promise;

		if (res.type === "User") {
			router.push(`/@${res.object.username}@${res.object.host}`);
		} else if (res.type === "Note") {
			router.push(`/notes/${res.object.id}`);
		}

		return;
	}

	let begin: Date | null = null;
	let end: Date | null = null;
	if (createAtBegin.value !== null) {
		begin = new Date(createAtBegin.value);
		begin.setMilliseconds(begin.getMilliseconds() - localTimeDiff);
	}
	if (createAtEnd.value !== null) {
		end = new Date(createAtEnd.value);
		end.setMilliseconds(end.getMilliseconds() - localTimeDiff);
	}

	notePagination = {
		endpoint: "notes/search",
		limit: 10,
		params: {
			query: query,
			userId: user.value ? user.value.id : null,
			origin: searchOrigin.value,
			createAtBegin: begin ? begin.getTime() : undefined,
			createAtEnd: end ? end.getTime() : undefined,
			reverseOrder: reverseOrder.value,
			hasFile: hasFile.value,
		},
	};

	key++;
}
</script>

<style lang="scss" module>
.formContent {
	margin-bottom: 15px;
}
</style>
