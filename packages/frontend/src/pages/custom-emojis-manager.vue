<template>
	<div>
		<MkStickyContainer>
			<template #header>
				<MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" />
			</template>
			<MkSpacer :contentMax="900">
				<div class="ogwlenmc">
					<div v-if="tab === 'local'" class="local">
						<MkCustomEmojiManagerLocal />
					</div>
					<div v-if="tab === 'draft'" class="draft">
						<MkCustomEmojiManagerDraft />
					</div>
				</div>
			</MkSpacer>
		</MkStickyContainer>
	</div>
</template>

<script lang="ts" setup>
import MkCustomEmojiManagerDraft from "@/components/MkCustomEmojiManagerDraft.vue";
import MkCustomEmojiManagerLocal from "@/components/MkCustomEmojiManagerLocal.vue";
import { i18n } from "@/i18n";
import * as os from "@/os";
import { definePageMetadata } from "@/scripts/page-metadata";
import { selectFile } from "@/scripts/select-file";
import { computed, defineAsyncComponent, ref } from "vue";

const tab = ref("draft");

const add = async (ev: MouseEvent) => {
	os.popup(
		defineAsyncComponent(() => import("@/components/MkEmojiEditDialog.vue")),
		{},
		{
			done: (result) => {
				//TODO: emitにして追加を反映
				// if (result.created) {
				// 	emojisPaginationComponent.value.prepend(result.created);
				// 	emojisPaginationComponent.value.reload();
				// }
			},
		},
		"closed",
	);
};

const menu = (ev: MouseEvent) => {
	os.popupMenu(
		[
			{
				icon: "ti ti-download",
				text: i18n.ts.export,
				action: async () => {
					os.api("export-custom-emojis", {})
						.then(() => {
							os.alert({
								type: "info",
								text: i18n.ts.exportRequested,
							});
						})
						.catch((err) => {
							os.alert({
								type: "error",
								text: err.message,
							});
						});
				},
			},
			{
				icon: "ti ti-upload",
				text: i18n.ts.import,
				action: async () => {
					const file = await selectFile(ev.currentTarget ?? ev.target);
					os.api("admin/emoji/import-zip", {
						fileId: file.id,
					})
						.then(() => {
							os.alert({
								type: "info",
								text: i18n.ts.importRequested,
							});
						})
						.catch((err) => {
							os.alert({
								type: "error",
								text: err.message,
							});
						});
				},
			},
		],
		ev.currentTarget ?? ev.target,
	);
};

const headerActions = $computed(() => [
	{
		asFullButton: true,
		icon: "ti ti-plus",
		text: i18n.ts.addEmoji,
		handler: add,
	},
	{
		icon: "ti ti-dots",
		handler: menu,
	},
]);

const headerTabs = $computed(() => [
	{
		key: "draft",
		title: i18n.ts.draftEmojis,
	},
	{
		key: "local",
		title: i18n.ts.local,
	},
	{
		key: "remote",
		title: i18n.ts.remote,
	},
]);

definePageMetadata(
	computed(() => ({
		title: i18n.ts.customEmojis,
		icon: "ti ti-icons",
	})),
);
</script>

<style lang="scss" scoped></style>
