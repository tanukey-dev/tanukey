<template>
<MkModalWindow
	ref="dialog"
	:width="370"
	:height="isRequest ? 600 : 700"
	:with-ok-button="true"
	@close="$refs.dialog.close()"
	@closed="$emit('closed')"
	@ok="ok()"
>
	<template #header>:{{ emoji.name }}:</template>

	<MkSpacer :margin-min="20" :margin-max="28">
		<div class="yigymqpb _gaps_m">
			<img :src="url" class="img"/>
			<button v-tooltip="i18n.ts.attachFile" class="_button" @click="chooseFileFrom"><i class="ti ti-photo-plus"></i></button>
			<MkInput v-model="name">
				<template #label>{{ i18n.ts.name }}</template>
			</MkInput>
			<MkInput v-model="category" :datalist="customEmojiCategories">
				<template #label>{{ i18n.ts.category }}</template>
			</MkInput>
			<MkInput v-model="aliases">
				<template #label>{{ i18n.ts.tags }}</template>
				<template #caption>{{ i18n.ts.setMultipleBySeparatingWithSpace }}</template>
			</MkInput>
			<MkInput v-model="license">
				<template #label>{{ i18n.ts.license }}</template>
			</MkInput>
			<MkSwitch v-if="!isRequest" v-model="draft" :disabled="isRequest">
				{{ i18n.ts.draft }}
			</MkSwitch>
			<MkButton v-if="!isRequest" danger @click="del()"><i class="ti ti-trash"></i> {{ i18n.ts.delete }}</MkButton>
		</div>
	</MkSpacer>
</MkModalWindow>
</template>

<script lang="ts" setup>
import { } from 'vue';
import { DriveFile } from 'misskey-js/built/entities';
import MkModalWindow from '@/components/MkModalWindow.vue';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import { selectFiles } from '@/scripts/select-file';
import * as os from '@/os';
import { i18n } from '@/i18n';
import { customEmojiCategories } from '@/custom-emojis';
import { $i } from '@/account';

const props = defineProps<{
	emoji: any,
	isRequest: boolean,
}>();

let dialog = $ref(null);
let name: string = $ref(props.emoji.name);
let category: string = $ref(props.emoji.category);
let aliases: string = $ref(props.emoji.aliases.join(' '));
let license: string = $ref(props.emoji.license ?? '');
let url = $ref(props.emoji.url);
let chooseFile: DriveFile|null = $ref(null);
let draft = $ref(props.emoji.draft);
let isRequest = $ref(props.isRequest);

const emit = defineEmits<{
	(ev: 'done', v: { deleted?: boolean, updated?: any }): void,
	(ev: 'closed'): void
}>();

function ok() {
	if (isRequest) {
		if (chooseFile !== null && name.match(/^[a-zA-Z0-9_]+$/)) {
			add();
		}
	} else {
		update();
	}
}

async function add() {
	const ret = await os.api('admin/emoji/add-draft', {
		name: name,
		category: category,
		aliases: aliases.split(' '),
		license: license === '' ? null : license,
		fileId: chooseFile.id,
	});

	emit('done', {
		updated: {
			id: ret.id,
			name,
			category,
			aliases: aliases.split(' '),
			license: license === '' ? null : license,
			draft: true,
		},
	});

	dialog.close();
}

async function update() {
	await os.apiWithDialog('admin/emoji/update', {
		id: props.emoji.id,
		name,
		category,
		aliases: aliases.split(' '),
		license: license === '' ? null : license,
		fileId: chooseFile?.id,
		draft: draft,
	});

	emit('done', {
		updated: {
			id: props.emoji.id,
			name,
			category,
			aliases: aliases.split(' '),
			license: license === '' ? null : license,
			draft: draft,
		},
	});

	dialog.close();
}

function chooseFileFrom(ev) {
	selectFiles(ev.currentTarget ?? ev.target, i18n.ts.attachFile).then(files_ => {
		chooseFile = files_[0];
		url = chooseFile.url;
	});
}

async function del() {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.t('removeAreYouSure', { x: name }),
	});
	if (canceled) return;

	os.api('admin/emoji/delete', {
		id: props.emoji.id,
	}).then(() => {
		emit('done', {
			deleted: true,
		});
		dialog.close();
	});
}
</script>

<style lang="scss" scoped>
.yigymqpb {
	> .img {
		display: block;
		height: 64px;
		margin: 0 auto;
	}
}
</style>
