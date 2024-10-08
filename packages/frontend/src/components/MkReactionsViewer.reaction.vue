<template>
<button
	v-if="showReaction"
	ref="buttonEl"
	v-ripple="canToggle"
	class="_button"
	:class="[$style.root, { [$style.reacted]: note.myReaction == reaction, [$style.canToggle]: canToggle, [$style.large]: defaultStore.state.largeNoteReactions }]"
	@click="toggleReaction()"
>
	<MkReactionIcon :class="$style.icon" :reaction="reaction" :emojiUrl="note.reactionEmojis[reaction.substr(1, reaction.length - 2)]"/>
	<span :class="$style.count">{{ showCount }}</span>
</button>
</template>

<script lang="ts" setup>
import { computed, onMounted, shallowRef, watch, ref } from "vue";
import * as misskey from "misskey-js";
import XDetails from "@/components/MkReactionsViewer.details.vue";
import MkReactionIcon from "@/components/MkReactionIcon.vue";
import * as os from "@/os";
import { useTooltip } from "@/scripts/use-tooltip";
import { $i } from "@/account";
import MkReactionEffect from "@/components/MkReactionEffect.vue";
import { claimAchievement } from "@/scripts/achievements";
import { defaultStore } from "@/store";
import { i18n } from "@/i18n";

const props = defineProps<{
	reaction: string;
	count: number;
	isInitial: boolean;
	note: misskey.entities.Note;
}>();

const buttonEl = shallowRef<HTMLElement>();

const canToggle = computed(() => !props.reaction.match(/@\w/) && $i);
const showReaction = ref(true);
const showCount = ref(props.count);

async function toggleReaction() {
	if (!canToggle.value) return;

	// TODO: その絵文字を使う権限があるかどうか確認

	const oldReaction = props.note.myReaction;
	if (oldReaction) {
		const confirm = await os.confirm({
			type: "warning",
			text:
				oldReaction !== props.reaction
					? i18n.ts.changeReactionConfirm
					: i18n.ts.cancelReactionConfirm,
		});
		if (confirm.canceled) return;

		os.api("notes/reactions/delete", {
			noteId: props.note.id,
		}).then(() => {
			if (oldReaction !== props.reaction) {
				os.api("notes/reactions/create", {
					noteId: props.note.id,
					reaction: props.reaction,
				});
			}
		});
	} else {
		os.api("notes/reactions/create", {
			noteId: props.note.id,
			reaction: props.reaction,
		});
		if (
			props.note.text &&
			props.note.text.length > 100 &&
			Date.now() - new Date(props.note.createdAt).getTime() < 1000 * 3
		) {
			claimAchievement("reactWithoutRead");
		}
	}
}

function anime() {
	if (document.hidden) return;
	if (!defaultStore.state.animation) return;

	const rect = buttonEl.value.getBoundingClientRect();
	const x = rect.left + 16;
	const y = rect.top + buttonEl.value.offsetHeight / 2;
	os.popup(MkReactionEffect, { reaction: props.reaction, x, y }, {}, "end");
}

watch(
	() => props.count,
	(newCount, oldCount) => {
		showCount.value = newCount;
		if (oldCount < newCount) {
			anime();
		}
	},
);

onMounted(() => {
	if (!props.isInitial) anime();
});

useTooltip(
	buttonEl,
	async (showing) => {
		const reactions = await os.api("notes/reactions", {
			noteId: props.note.id,
			type: props.reaction,
			limit: 11,
			_cacheKey_: props.count,
		});

		// ミュートしているユーザーのリアクションがあることを隠す
		if (reactions.length === 0) {
			showReaction.value = false;
			return;
		}

		showCount.value = reactions.length;

		const users = reactions.map((x) => x.user);

		os.popup(
			XDetails,
			{
				showing,
				reaction: props.reaction,
				users,
				count: props.count,
				targetElement: buttonEl.value,
			},
			{},
			"closed",
		);
	},
	100,
);
</script>

<style lang="scss" module>
.root {
	display: inline-block;
	height: 32px;
	margin: 2px;
	padding: 0 6px;
	border-radius: 4px;

	&.canToggle {
		background: var(--buttonBg);

		&:hover {
			background: rgba(0, 0, 0, 0.1);
		}
	}

	&:not(.canToggle) {
		cursor: default;
	}

	&.large {
		height: 42px;
		font-size: 1.5em;
		border-radius: 6px;

		> .count {
			font-size: 0.7em;
			line-height: 42px;
		}
	}

	&.reacted, &.reacted:hover {
    background: var(--accentedBg);
    color: var(--accent);
    border: 1px solid var(--accent);

		> .count {
			color: var(--accent);
		}
	}
}

.count {
	font-size: 0.9em;
	line-height: 32px;
	margin: 0 0 0 4px;
}
</style>
