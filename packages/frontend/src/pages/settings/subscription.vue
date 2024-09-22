<template>
<div class="_gaps_m">
	<div class="_gaps_s">
		<MkKeyValue>
			<template #key>{{ i18n.ts.subscriptionStatus }}</template>
			<template #value>{{ i18n.t(`_subscription.${subscriptionStatus}`) }}</template>
		</MkKeyValue>
	</div>
	<FormPagination ref="list" :pagination="pagination">
		<template #empty>
			<div class="_fullinfo">
				<img :src="infoImageUrl" class="_ghost"/>
				<div>{{ i18n.ts.nothing }}</div>
			</div>
		</template>
		<template #default="{items}">
			<div class="_gaps">
				<div v-for="plan in items" :key="plan.id" class="_panel" :class="$style.plan">
					<div :class="$style.planBody">
						<div :class="$style.planName">{{ plan.name + ((statuses.filter(s => s.planId === plan.id && s.status === 'active').length > 0) ? (' (' + i18n.ts._subscription.active + ')') : '') }}</div>
						<div>{{ plan.description }}</div>
						<MkKeyValue oneline>
							<template #key>{{ i18n.ts._subscription.price }}</template>
							<template #value>{{ plan.price + ' ' + plan.currency }}</template>
						</MkKeyValue>
						<div>
							<MkButton v-if="statuses.filter(s => s.planId === plan.id && s.status === 'active').length > 0" :class="$style.button" @click="subscribe(plan)"><i class="ti ti-settings"></i>{{ i18n.ts._subscription.manage }}</MkButton>
							<MkButton v-else primary :class="$style.button" @click="subscribe(plan)"><i class="ti ti-plus"></i>{{ i18n.ts._subscription.subscribe }}</MkButton>
						</div>
					</div>
				</div>
			</div>
		</template>
	</FormPagination>
</div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { i18n } from "@/i18n.js";
import * as os from "@/os.js";
import { infoImageUrl } from "@/instance.js";
import MkKeyValue from "@/components/MkKeyValue.vue";
import FormPagination from "@/components/MkPagination.vue";
import MkButton from "@/components/MkButton.vue";
import { definePageMetadata } from "@/scripts/page-metadata.js";

const list = ref<InstanceType<typeof FormPagination>>();
const statuses = ref<{ planId: string; status: string }[]>([]);

const pagination = {
	endpoint: "subscription-plans/list" as const,
	limit: 10,
	noPaging: true,
};

async function subscribe(plan) {
	const redirect = await os.apiWithDialog("subscription/create", {
		planId: plan.id,
	});
	if (redirect) {
		location.href = redirect.redirect.destination;
	}
}

onMounted(async () => {
	const userSubsctiptionStatuses = await os.api("subscription/status");
	statuses.value = userSubsctiptionStatuses;
});

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata({
	title: i18n.ts.subscription,
	icon: "ti ti-credit-card",
});
</script>

<style lang="scss" module>
.plan {
	display: flex;
	padding: 16px;
}

.planName {
	font-weight: bold;
}

.planBody {
	width: calc(100% - 62px);
	position: relative;
}

.button {
	margin: 8px 0;
}
</style>
