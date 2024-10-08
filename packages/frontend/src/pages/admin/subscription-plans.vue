<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="900">
		<div class="_gaps">
			<MkFolder v-for="subscriptionPlan in subscriptionPlans" :key="subscriptionPlan.id ?? subscriptionPlan._id" :defaultOpen="subscriptionPlan.id == null">
				<template #label>{{ subscriptionPlan.name }}</template>
				<template #icon>
					<i v-if="subscriptionPlan.id && subscriptionPlan.isArchived" class="ti ti-archive"></i>
				</template>
				<template #caption>{{ subscriptionPlan.description }}</template>

				<div class="_gaps_m">
					<MkInput v-model="subscriptionPlan.name">
						<template #label>{{ i18n.ts.name }}</template>
					</MkInput>
					<MkInput v-model="subscriptionPlan.price" type="number">
						<template #label>{{ i18n.ts._subscription.price }}</template>
					</MkInput>
					<MkInput v-model="subscriptionPlan.currency">
						<template #label>{{ i18n.ts._subscription.currency }}</template>
					</MkInput>
					<MkTextarea v-model="subscriptionPlan.description">
						<template #label>{{ i18n.ts.description }}</template>
					</MkTextarea>
					<MkInput v-model="subscriptionPlan.stripePriceId">
						<template #label>{{ i18n.ts._subscription.stripePriceId }}</template>
					</MkInput>
					<MkInput v-model="subscriptionPlan.roleId">
						<template #label>{{ i18n.ts.role }}</template>
					</MkInput>
					<div class="buttons _buttons">
						<MkButton v-if="subscriptionPlan.isArchived !== true" class="button" inline primary @click="save(subscriptionPlan)"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
						<MkButton v-if="subscriptionPlan.id != null" class="button" inline danger @click="archive(subscriptionPlan)"><i class="ti ti-trash"></i> {{ i18n.ts.archive }}</MkButton>
					</div>
				</div>
			</MkFolder>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import MkButton from "@/components/MkButton.vue";
import MkInput from "@/components/MkInput.vue";
import MkTextarea from "@/components/MkTextarea.vue";
import * as os from "@/os.js";
import { i18n } from "@/i18n.js";
import { definePageMetadata } from "@/scripts/page-metadata.js";
import MkFolder from "@/components/MkFolder.vue";

const subscriptionPlans = ref<any[]>([]);

function add() {
	subscriptionPlans.value.unshift({
		_id: Math.random().toString(36),
		id: null,
		name: "",
		price: 0,
		currency: "",
		description: "",
		stripePriceId: "",
		roleId: "",
	});
}

function archive(subscriptionPlan) {
	os.confirm({
		type: "warning",
		text: i18n.t("channelArchiveConfirmTitle", { name: subscriptionPlan.name }),
	}).then(({ canceled }) => {
		if (canceled) return;
		os.api("admin/subscription-plans/archive", { planId: subscriptionPlan.id });
		load();
	});
}

async function save(subscriptionPlan) {
	if (subscriptionPlan.id == null) {
		await os.apiWithDialog("admin/subscription-plans/create", {
			name: subscriptionPlan.name,
			price: subscriptionPlan.price,
			currency: subscriptionPlan.currency,
			description: subscriptionPlan.description,
			stripePriceId: subscriptionPlan.stripePriceId,
			roleId: subscriptionPlan.roleId,
		});
		load();
	} else {
		os.apiWithDialog("admin/subscription-plans/update", {
			planId: subscriptionPlan.id,
			name: subscriptionPlan.name,
			price: subscriptionPlan.price,
			currency: subscriptionPlan.currency,
			description: subscriptionPlan.description,
			stripePriceId: subscriptionPlan.stripePriceId,
			roleId: subscriptionPlan.roleId,
		});
	}
}

function load() {
	os.api("subscription-plans/list").then((_subscriptionPlans) => {
		subscriptionPlans.value = _subscriptionPlans;
	});
}

load();

const headerActions = computed(() => [
	{
		asFullButton: true,
		icon: "ti ti-plus",
		text: i18n.ts.add,
		handler: add,
	},
]);

const headerTabs = computed(() => []);

definePageMetadata({
	title: i18n.ts.subscription,
	icon: "ti ti-credit-card",
});
</script>
