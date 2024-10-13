<template>
	<div class="_gaps">
		<div class="_gaps">
			<MkInput v-model="searchQuery" :large="true" :autofocus="true" type="search">
				<template #prefix><i class="ti ti-search"></i></template>
			</MkInput>
			<MkRadios v-model="searchOrigin">
				<option value="local">{{ i18n.ts.local }}</option>
				<option value="remote">{{ i18n.ts.remote }}</option>
				<option value="combined">{{ i18n.ts.all }}</option>
			</MkRadios>
			<MkButton large primary gradate rounded @click="search">{{ i18n.ts.search }}</MkButton>
		</div>

		<MkFoldableSection v-if="userPagination">
			<template #header>{{ i18n.ts.searchResult }}</template>
			<MkUserList :key="key" :pagination="userPagination" />
		</MkFoldableSection>
	</div>
</template>

<script lang="ts" setup>
import MkUserList from "@/components/MkUserList.vue";
import MkInput from "@/components/MkInput.vue";
import MkRadios from "@/components/MkRadios.vue";
import MkButton from "@/components/MkButton.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";
import MkFoldableSection from "@/components/MkFoldableSection.vue";
import { router } from "@/router";

let key = $ref("");
let searchQuery = $ref("");
let searchOrigin = $ref("local");
let userPagination = $ref();

async function search() {
	const query = searchQuery.toString().trim();

	if (query == null || query === "") return;

	console.log(query);

	if (query.startsWith("https://") || query.match(/^@[\w]+@[\w.]+$/)) {
		let url = query;

		//@user@host 形式での検索に対応
		const result = query.match(/^@([\w]+)@([\w.]+)$/);
		if (result) {
			url = "https://" + result[2] + "/@" + result[1];
		}

		//照会
		const promise = os.api("ap/show", {
			uri: url,
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

	userPagination = {
		endpoint: "users/search",
		limit: 10,
		params: {
			query: searchQuery,
			origin: searchOrigin,
		},
	};

	key = query;
}
</script>
