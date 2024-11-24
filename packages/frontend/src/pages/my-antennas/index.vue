<template>
	<MkStickyContainer>
		<template #header>
			<MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" />
		</template>
		<MkSpacer :contentMax="700">
			<div v-if="tab === 'search'">
				<div class="_gaps">
					<MkInput v-model="searchQuery" :large="true" :autofocus="true" type="search">
						<template #prefix><i class="ti ti-search"></i></template>
					</MkInput>
					<MkButton large primary gradate rounded @click="search">{{ i18n.ts.search }}</MkButton>
				</div>

				<MkFoldableSection v-if="channelPagination">
					<template #header>{{ i18n.ts.searchResult }}</template>
					<MkPagination :pagination="channelPagination">
						<template #empty>
							<div class="_fullinfo">
								<img :src="infoImageUrl" class="_ghost" />
								<div>{{ i18n.ts.notFound }}</div>
							</div>
						</template>

						<template #default="{ items }">
							<MkA v-for="item in items" :key="item.id" :class="$style.antenna"
								:to="`/secure/timeline/antenna/${item.id}`">
								<div class="name">{{ item.name }}</div>
							</MkA>
						</template>
					</MkPagination>
				</MkFoldableSection>
			</div>
			<div v-else-if="tab === 'owned'">
				<div v-if="antennas.length === 0" class="empty">
					<div class="_fullinfo">
						<img :src="infoImageUrl" class="_ghost" />
						<div>{{ i18n.ts.nothing }}</div>
					</div>
				</div>

				<MkButton :link="true" to="/secure/my/antennas/create" primary :class="$style.add"><i
						class="ti ti-plus"></i> {{
							i18n.ts.add }}</MkButton>

				<div v-if="antennas.length > 0" class="_gaps">
					<MkA v-for="antenna in antennas" :key="antenna.id" :class="$style.antenna"
						:to="`/secure/timeline/antenna/${antenna.id}`">
						<div class="name">{{ antenna.name }}</div>
					</MkA>
				</div>
			</div>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import MkButton from "@/components/MkButton.vue";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { antennasCache } from "@/cache";
import { api } from "@/os";
import { onActivated } from "vue";
import { infoImageUrl } from "@/instance";
import MkInput from "@/components/MkInput.vue";
import MkFoldableSection from "@/components/MkFoldableSection.vue";
import MkPagination from "@/components/MkPagination.vue";
import MkA from "@/components/global/MkA.vue";

let key = $ref("");
let tab = $ref("owned");
let searchQuery = $ref("");
let channelPagination = $ref();

const antennas = $computed(() => antennasCache.value.value ?? []);

async function search() {
	const query = searchQuery.toString().trim();

	if (query == null) return;

	channelPagination = {
		endpoint: "antennas/search",
		limit: 10,
		params: {
			query: searchQuery,
		},
	};

	key = query;
}

function fetch() {
	antennasCache.fetch(() => api("antennas/list"));
}

fetch();

const headerActions = $computed(() => [
	{
		asFullButton: true,
		icon: "ti ti-refresh",
		text: i18n.ts.reload,
		handler: () => {
			antennasCache.delete();
			fetch();
		},
	},
]);

const headerTabs = $computed(() => [
	{
		key: "search",
		title: i18n.ts.search,
		icon: "ti ti-search",
	},
	{
		key: "owned",
		title: i18n.ts._channel.owned,
		icon: "ti ti-edit",
	},
]);

definePageMetadata({
	title: i18n.ts.manageAntennas,
	icon: "ti ti-antenna",
});

onActivated(() => {
	antennasCache.fetch(() => api("antennas/list"));
});
</script>

<style lang="scss" module>
.add {
	margin: 0 auto 16px auto;
}

.antenna {
	display: block;
	padding: 16px;
	border: solid 1px var(--divider);
	border-radius: 6px;

	&:hover {
		border: solid 1px var(--accent);
		text-decoration: none;
	}
}

.name {
	font-weight: bold;
}
</style>
