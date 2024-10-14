<template>
	<div :class="$style.root" @dragover.stop="onDragover" @dragenter="onDragenter" @dragleave="onDragleave"
		@drop.stop="onDrop">
		<MkStickyContainer>
			<template #header>
				<div :class="$style.headerContainer">
					<header :class="$style.header">
						<div :class="$style.headerLeft">
							<button v-tooltip="i18n.ts.attachFile" class="_button" :class="$style.footerButton"
								@click="chooseFileFrom"><i class="ti ti-photo-plus"></i></button>
							<button v-tooltip="i18n.ts.mention" class="_button" :class="$style.footerButton"
								@click="insertMention"><i class="ti ti-at"></i></button>
							<button v-tooltip="i18n.ts.emoji" :class="['_button', $style.footerButton]"
								@click="insertEmoji"><i class="ti ti-mood-happy"></i></button>
						</div>
						<div :class="$style.headerRight">
							<button v-if="isMobile" v-tooltip="i18n.ts.previewNoteText" class="_button"
								@click="showPreview = !showPreview"><i class="ti ti-eye"></i></button>
							<div :class="$style.buttons">
								<slot></slot>
							</div>
						</div>
					</header>
				</div>
			</template>
			<div v-if="!isMobile" :class="$style.mainContent">
				<textarea ref="textareaEl" v-model="text" :class="$style.text" data-cy-post-form-text @paste="onPaste"
					:style="textareaMainStyle" @input="handleInputMain($event)" @compositionupdate="onCompositionUpdate"
					@compositionend="onCompositionEnd"></textarea>
				<Mfm :class="$style.mfm" :text="text" :author="$i" :i="$i" />
			</div>
			<div v-if="isMobile" :class="$style.mainContentMobile">
				<textarea ref="textareaEl" v-model="text" :class="[$style.text, $style.textMobile]"
					data-cy-post-form-text @paste="onPaste" :style="textareaMainStyle" @input="handleInputMain($event)"
					@compositionupdate="onCompositionUpdate" @compositionend="onCompositionEnd"></textarea>
				<Mfm v-if="showPreview" :class="[$style.mfm, $style.mfmMobile]" :text="text" :author="$i" :i="$i" />
			</div>
		</MkStickyContainer>
	</div>
</template>

<script lang="ts" setup>
import {
	onMounted,
	nextTick,
	computed,
	ref
} from "vue";
import insertTextAtCursor from "insert-text-at-cursor";
import * as Acct from "misskey-js/built/acct";
import { formatTimeString } from "@/scripts/format-time-string";
import { Autocomplete } from "@/scripts/autocomplete";
import * as os from "@/os";
import { selectFiles } from "@/scripts/select-file";
import { defaultStore } from "@/store";
import { i18n } from "@/i18n";
import { uploadFile } from "@/scripts/upload";
import { $i } from '@/account';

const textareaEl = $shallowRef<HTMLTextAreaElement | null>(null);
const text = defineModel<string>()
let draghover = $ref(false);
let imeText = $ref("");
const showPreview = ref(false);

const textareaMainHeight = ref(600);
const textareaMainStyle = computed(() => {
	return { height: `${textareaMainHeight.value + 2}px` };
});

function handleInputMain(event: any) {
	handleInput(event, textareaMainHeight);
}

function handleInput(event: any, textareaHeight: any) {
	const tmp = textareaHeight.value;
	textareaHeight.value = 0;
	nextTick(() => {
		if (event.target.scrollHeight > tmp) {
			textareaHeight.value = event.target.scrollHeight;
		} else {
			textareaHeight.value = tmp;
		}
	});
}

const isMobile = ref(window.innerWidth <= 500);
window.addEventListener("resize", () => {
	isMobile.value = window.innerWidth <= 500;
});

function chooseFileFrom(ev) {
	selectFiles(ev.currentTarget ?? ev.target, i18n.ts.attachFile).then(
		(files_) => {
			for (const file of files_) {
				// タグの追加
			}
		},
	);
}

function upload(file: File, name?: string) {
	uploadFile(file, defaultStore.state.uploadFolder, name).then((res) => {
	});
}

function onCompositionUpdate(ev: CompositionEvent) {
	imeText = ev.data;
}

function onCompositionEnd(ev: CompositionEvent) {
	imeText = "";
}

async function onPaste(ev: ClipboardEvent) {
	for (const { item, i } of Array.from(ev.clipboardData.items).map(
		(item, i) => ({ item, i }),
	)) {
		if (item.kind === "file") {
			const file = item.getAsFile();
			const lio = file.name.lastIndexOf(".");
			const ext = lio >= 0 ? file.name.slice(lio) : "";
			const formatted = `${formatTimeString(new Date(file.lastModified), defaultStore.state.pastedFileName).replace(/{{number}}/g, `${i + 1}`)}${ext}`;
			upload(file, formatted);
		}
	}
}

function onDragover(ev) {
	if (!ev.dataTransfer.items[0]) return;
	const isFile = ev.dataTransfer.items[0].kind === "file";
	const isDriveFile = ev.dataTransfer.types[0] === _DATA_TRANSFER_DRIVE_FILE_;
	if (isFile || isDriveFile) {
		ev.preventDefault();
		draghover = true;
		switch (ev.dataTransfer.effectAllowed) {
			case "all":
			case "uninitialized":
			case "copy":
			case "copyLink":
			case "copyMove":
				ev.dataTransfer.dropEffect = "copy";
				break;
			case "linkMove":
			case "move":
				ev.dataTransfer.dropEffect = "move";
				break;
			default:
				ev.dataTransfer.dropEffect = "none";
				break;
		}
	}
}

function onDragenter(ev) {
	draghover = true;
}

function onDragleave(ev) {
	draghover = false;
}

function onDrop(ev): void {
	draghover = false;

	// ファイルだったら
	if (ev.dataTransfer.files.length > 0) {
		ev.preventDefault();
		for (const x of Array.from(ev.dataTransfer.files)) upload(x);
		return;
	}

	//#region ドライブのファイル
	const driveFile = ev.dataTransfer.getData(_DATA_TRANSFER_DRIVE_FILE_);
	if (driveFile != null && driveFile !== "") {
		const file = JSON.parse(driveFile);
		// TODO: タグの追加
		ev.preventDefault();
	}
	//#endregion
}

function insertMention() {
	os.selectUser().then((user) => {
		insertTextAtCursor(textareaEl, "@" + Acct.toString(user) + " ");
	});
}

async function insertEmoji(ev: MouseEvent) {
	os.openEmojiPicker(ev.currentTarget ?? ev.target, {}, textareaEl);
}

onMounted(async () => {
	// TODO: detach when unmount
	new Autocomplete(textareaEl, $$(text));
});
</script>

<style lang="scss" module>
.root {
	display: flex;
	flex-direction: column;
	background-color: var(--bg);
	padding: 10px;
	height: 100dvh;
}

//#region header
.headerContainer {
	background-color: var(--bg);
	padding-top: 5px;
	padding-bottom: 5px;
}

.header {
	display: grid;
	grid-template-columns: 1fr 1fr;
	background: var(--panel);
	padding: 5px;
}

.headerLeft {
	display: grid;
	grid-auto-flow: column;
	column-gap: 10px;
	justify-content: left;
}

.headerRight {
	display: grid;
	grid-auto-flow: column;
	column-gap: 10px;
	justify-content: right;
}

.buttons {
	display: grid;
	grid-auto-flow: column;
	column-gap: 10px;
	justify-content: right;
	margin-left: 10px;
}

.mainContent {
	display: grid;
	grid-auto-flow: column;
	grid-template-columns: 1fr 1fr;
	column-gap: 10px;
	margin-top: 10px;
}

.mainContentMobile {
	display: grid;
	margin-top: 10px;
}

.textMobile {
	grid-area: 1/1;
	z-index: 10;
}

.mfm {
	padding: 10px;
}

.mfmMobile {
	grid-area: 1/1;
	z-index: 100;
	background-color: var(--bg);
}

.headerRightItem {
	margin: 0;
	padding: 8px;
	border-radius: 6px;

	&:hover {
		background: var(--X5);
	}

	&:disabled {
		background: none;
	}

	&.danger {
		color: #ff2a2a;
	}
}

.headerRightButtonText {
	padding-left: 6px;
}

//#endregion

.preview {
	padding: 16px 20px 20px 20px;
}

.targetNote {
	padding: 0 20px 16px 20px;
}

.withQuote {
	margin: 0 0 8px 0;
	color: var(--accent);
}

.toSpecified {
	padding: 6px 24px;
	margin-bottom: 8px;
	overflow: auto;
	white-space: nowrap;
}

.visibleUsers {
	display: inline;
	top: -1px;
	font-size: 14px;
}

.visibleUser {
	margin-right: 14px;
	padding: 8px 0 8px 8px;
	border-radius: 8px;
	background: var(--X4);
}

.hasNotSpecifiedMentions {
	margin: 0 20px 16px 20px;
}

.text {
	display: block;
	box-sizing: border-box;
	padding: 10px;
	margin: 0;
	width: 100%;
	font-size: 1.05em;
	border: none;
	border-radius: 0;
	background: var(--panel);
	color: var(--fg);
	font-family: inherit;
	line-height: 1.5em;
	resize: vertical;

	&:focus {
		outline: none;
	}

	&:disabled {
		opacity: 0.5;
	}
}

.footer {
	display: flex;
	padding: 0 16px 16px 16px;
	font-size: 1em;
}

.footerLeft {
	flex: 1;
	display: grid;
	grid-auto-flow: row;
	grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
	grid-auto-rows: 40px;
}

.footerRight {
	flex: 0;
	margin-left: auto;
	display: grid;
	grid-auto-flow: row;
	grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
	grid-auto-rows: 40px;
	direction: rtl;
}

.footerButton {
	display: inline-block;
	padding: 0;
	margin: 0;
	font-size: 1em;
	width: auto;
	height: 100%;
	border-radius: 6px;

	&:hover {
		background: var(--X5);
	}

	&.footerButtonActive {
		color: var(--accent);
	}
}
</style>
