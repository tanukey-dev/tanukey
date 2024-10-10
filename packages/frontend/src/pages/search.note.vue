<template>
	<div class="_gaps">
		<div class="_gaps">
			<MkInput v-model="searchQuery" :large="true" :autofocus="true" type="search">
				<template #prefix><i class="ti ti-search"></i></template>
			</MkInput>
			<MkFolder :defaultOpen="optionOpen">
				<template #label>{{ i18n.ts.options }}</template>

				<MkTextarea v-model="users">
					<template #label>{{ i18n.ts.users }}</template>
					<template #caption>{{ i18n.ts.antennaUsersDescription }} <button class="_textButton"
							@click="addUser">{{ i18n.ts.addUser }}</button></template>
				</MkTextarea>

				<MkTextarea v-model="keywords">
					<template #label>{{ i18n.ts.antennaKeywords }}</template>
					<template #caption>{{ i18n.ts.antennaKeywordsDescription }}</template>
				</MkTextarea>

				<MkTextarea v-model="excludeKeywords">
					<template #label>{{ i18n.ts.antennaExcludeKeywords }}</template>
					<template #caption>{{ i18n.ts.antennaKeywordsDescription }}</template>
				</MkTextarea>

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
				<MkButton large primary gradate rounded style="margin: 0 auto;" @click="search">{{ i18n.ts.search }}
				</MkButton>
			</div>
		</div>

		<MkFoldableSection v-if="notePagination">
			<template #header>{{ i18n.ts.searchResult }}</template>
			<MkNotes :key="key" :pagination="notePagination" />
		</MkFoldableSection>
	</div>
</template>

<script lang="ts" setup>
import MkButton from "@/components/MkButton.vue";
import MkFoldableSection from "@/components/MkFoldableSection.vue";
import MkFolder from "@/components/MkFolder.vue";
import MkInput from "@/components/MkInput.vue";
import MkNotes from "@/components/MkNotes.vue";
import MkRadios from "@/components/MkRadios.vue";
import MkSwitch from "@/components/MkSwitch.vue";
import MkTextarea from "@/components/MkTextarea.vue";
import FormSplit from "@/components/form/split.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";
import { useRouter } from "@/router";
import * as Acct from "misskey-js/built/acct";
import { ref, watch } from "vue";

const router = useRouter();

let key = $ref(0);
const searchQuery = ref("");
const searchOrigin = ref<string>("local");
let notePagination = $ref();
const createAtBegin = ref<any>(null);
const createAtEnd = ref<any>(null);
const reverseOrder = ref<any>(false);
const hasFile = ref<any>(false);
const optionOpen = ref(false);
const users = ref("");
const keywords = ref("");
const excludeKeywords = ref("");

watch(searchQuery, () => {
	updateUrlParameter();
});
watch(searchOrigin, () => {
	updateUrlParameter();
});
watch(users, () => {
	updateUrlParameter();
});
watch(keywords, () => {
	updateUrlParameter();
});
watch(excludeKeywords, () => {
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
	setSearchParams(searchParams, "users", users.value);
	setSearchParams(searchParams, "keywords", keywords.value);
	setSearchParams(searchParams, "excludeKeywords", excludeKeywords.value);
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
	const usersParam = searchParams.get("users");
	if (usersParam) {
		users.value = usersParam;
		optionOpen.value = true;
	}
	const keywordsParam = searchParams.get("keywords");
	if (keywordsParam) {
		keywords.value = keywordsParam;
		optionOpen.value = true;
	}
	const excludeKeywordsParam = searchParams.get("excludeKeywords");
	if (excludeKeywordsParam) {
		excludeKeywords.value = excludeKeywordsParam;
		optionOpen.value = true;
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

async function search() {
	const query = searchQuery.value.toString().trim();

	if (query.startsWith("https://")) {
		const promise = os.api("ap/show", {
			uri: query,
		});

		os.promiseDialog(promise, null, null, i18n.ts.fetchingAsApObject);

		const res = await promise;

		if (res.type === "User") {
			router.push(`/secure/@${res.object.username}@${res.object.host}`);
		} else if (res.type === "Note") {
			router.push(`/secure/notes/${res.object.id}`);
		}

		return;
	}

	let begin: Date | null = null;
	let end: Date | null = null;
	if (createAtBegin.value !== null) {
		begin = new Date(createAtBegin.value);
	}
	if (createAtEnd.value !== null) {
		end = new Date(createAtEnd.value);
	}

	notePagination = {
		endpoint: "notes/search",
		limit: 10,
		params: {
			query: query,
			users: users.value
				.trim()
				.split("\n")
				.map((x) => x.trim()),
			origin: searchOrigin.value,
			createAtBegin: begin ? begin.getTime() : undefined,
			createAtEnd: end ? end.getTime() : undefined,
			reverseOrder: reverseOrder.value,
			hasFile: hasFile.value,
			keywords: keywords.value
				.trim()
				.split("\n")
				.map((x) => x.trim().replace(/\s+/g, " ").split(" ")),
			excludeKeywords: excludeKeywords.value
				.trim()
				.split("\n")
				.map((x) => x.trim().replace(/\s+/g, " ").split(" ")),
		},
	};

	key++;
}

function addUser() {
	os.selectUser().then((user) => {
		users.value = users.value.trim();
		users.value += `\n@${Acct.toString(user)}`;
		users.value = users.value.trim();
	});
}
</script>

<style lang="scss" module>
.formContent {
	margin-bottom: 15px;
}
</style>
