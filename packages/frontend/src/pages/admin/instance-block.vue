<template>
<MkStickyContainer>
	<template #header><XHeader :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="700" :marginMin="16" :marginMax="32">
		<FormSuspense :p="init">
			<MkTextarea v-model="blockedHosts">
				<span>{{ i18n.ts.blockedInstances }}</span>
				<template #caption>{{ i18n.ts.blockedInstancesDescription }}</template>
			</MkTextarea>

			<MkSwitch v-model="enableAllowedHostsInWhiteList">
				<template #label>{{ i18n.ts.enableAllowedHostsInWhiteList }}</template>
			</MkSwitch>

			<MkTextarea v-model="allowedHosts">
				<span>{{ i18n.ts.allowedInstances }}</span>
				<template #caption>{{ i18n.ts.allowedInstancesDescription }}</template>
			</MkTextarea>

			<MkSwitch v-model="enableAllowedNotificationInLocalUserFollowed">
				<template #label>{{ i18n.ts.enableAllowedNotificationInLocalUserFollowed }}</template>
			</MkSwitch>

			<MkButton primary @click="save"><i class="ti ti-device-floppy"></i> {{ i18n.ts.save }}</MkButton>
		</FormSuspense>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import {} from "vue";
import XHeader from "./_header_.vue";
import MkButton from "@/components/MkButton.vue";
import MkSwitch from "@/components/MkSwitch.vue";
import MkTextarea from "@/components/MkTextarea.vue";
import FormSuspense from "@/components/form/suspense.vue";
import * as os from "@/os";
import { fetchInstance } from "@/instance";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";

let blockedHosts: string = $ref("");
let allowedHosts: string = $ref("");
let enableAllowedHostsInWhiteList: boolean = $ref(false);
let enableAllowedNotificationInLocalUserFollowed: boolean = $ref(false);

async function init() {
	const meta = await os.api("admin/meta");
	blockedHosts = meta.blockedHosts.join("\n");
	allowedHosts = meta.allowedHosts.join("\n");
	enableAllowedHostsInWhiteList = meta.enableAllowedHostsInWhiteList;
	enableAllowedNotificationInLocalUserFollowed =
		meta.enableAllowedNotificationInLocalUserFollowed;
}

function save() {
	os.apiWithDialog("admin/update-meta", {
		blockedHosts: blockedHosts.split("\n") || [],
		allowedHosts: allowedHosts.split("\n") || [],
		enableAllowedHostsInWhiteList: enableAllowedHostsInWhiteList,
		enableAllowedNotificationInLocalUserFollowed:
			enableAllowedNotificationInLocalUserFollowed,
	}).then(() => {
		fetchInstance();
	});
}

const headerActions = $computed(() => []);

const headerTabs = $computed(() => []);

definePageMetadata({
	title: i18n.ts.instanceBlocking,
	icon: "ti ti-ban",
});
</script>
