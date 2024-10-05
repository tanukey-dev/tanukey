<template>
	<button v-if="emoji.status === 'DRAFT'" class="_button" :class="[$style.root, $style.draft]" @click="menu">
		<img v-if="emoji.uploadedUserName !== null" :src="emoji.url" :class="$style.img" loading="lazy" />
		<div :class="$style.body">
			<div :class="$style.name" class="_monospace">{{ '(draft) ' + emoji.name }}</div>
			<div :class="$style.info">{{ emoji.aliases.join(' ') }}</div>
		</div>
	</button>
	<button v-else-if="emoji.status === 'REJECTED'" class="_button" :class="[$style.root, $style.rejected]"
		@click="menu">
		<img v-if="emoji.uploadedUserName !== null" :src="emoji.url" :class="$style.img" loading="lazy" />
		<div :class="$style.body">
			<div :class="$style.name" class="_monospace">{{ '(rejected) ' + emoji.name }}</div>
			<div :class="$style.info">{{ emoji.aliases.join(' ') }}</div>
		</div>
	</button>
	<button v-else class="_button" :class="$style.root" @click="menu">
		<img v-if="emoji.uploadedUserName !== null" :src="emoji.url" :class="$style.img" loading="lazy" />
		<div :class="$style.body">
			<div :class="$style.name" class="_monospace">{{ emoji.name }}</div>
			<div :class="$style.info">{{ emoji.aliases.join(' ') }}</div>
		</div>
	</button>
</template>

<script lang="ts" setup>
import { $i } from "@/account";
import { i18n } from "@/i18n";
import * as os from "@/os";
import copyToClipboard from "@/scripts/copy-to-clipboard";
import { defineAsyncComponent } from "vue";

const props = defineProps<{
	emoji: {
		name: string;
		aliases: string[];
		category: string;
		url: string;
		status: 'DRAFT' | 'APPROVED' | 'REJECTED';
		license: string;
		uploadedUserName: string | null;
	};
}>();

async function menu(ev) {
	os.popupMenu(
		[
			{
				type: "label",
				text: `:${props.emoji.name}:`,
			},
			{
				text: i18n.ts.edit,
				icon: "ti ti-edit",
				disabled: props.emoji.uploadedUserName !== null && props.emoji.uploadedUserName !== $i?.username,
				action: () => {
					edit();
				},
			},
			{
				text: i18n.ts.copy,
				icon: "ti ti-copy",
				action: () => {
					copyToClipboard(`:${props.emoji.name}:`);
					os.success();
				},
			},
			{
				text: i18n.ts.info,
				icon: "ti ti-info-circle",
				action: () => {
					os.popup(
						defineAsyncComponent(
							() => import("@/components/MkEmojiInfoDialog.vue"),
						),
						{
							emoji: props.emoji,
						},
					);
				},
			},
		],
		ev.currentTarget ?? ev.target,
	);
}

const edit = () => {
	os.popup(
		defineAsyncComponent(() => import("@/components/MkEmojiEditDialog.vue")),
		{
			emoji: props.emoji,
			isRequest: true,
		},
		{
			done: (result) => {
			},
		},
		"closed",
	);
};
</script>

<style lang="scss" module>
.root {
	display: flex;
	align-items: center;
	padding: 12px;
	text-align: left;
	background: var(--panel);
	border-radius: 8px;
	flex-wrap: wrap;

	&:hover {
		border-color: var(--accent);
	}
}

.img {
	width: 100%;
	height: 42px;
	object-fit: contain;
}

.body {
	margin-top: 8px;
	padding: 0 0 0 8px;
	white-space: nowrap;
	overflow: hidden;
}

.name {
	text-overflow: ellipsis;
	overflow: hidden;
}

.info {
	opacity: 0.5;
	font-size: 0.9em;
	text-overflow: ellipsis;
	overflow: hidden;
}

.draft {
	--c: rgb(255 196 0 / 15%);
	;
	background-image: linear-gradient(45deg, var(--c) 16.67%, transparent 16.67%, transparent 50%, var(--c) 50%, var(--c) 66.67%, transparent 66.67%, transparent 100%);
	background-size: 16px 16px;
}

.rejected {
	--c: rgba(0, 55, 255, 0.15);
	;
	background-image: linear-gradient(45deg, var(--c) 16.67%, transparent 16.67%, transparent 50%, var(--c) 50%, var(--c) 66.67%, transparent 66.67%, transparent 100%);
	background-size: 16px 16px;
}
</style>
