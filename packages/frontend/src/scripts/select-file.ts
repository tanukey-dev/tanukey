import { ref } from 'vue';
import { DriveFile } from 'misskey-js/built/entities';
import * as os from '@/os';
import { stream } from '@/stream';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';
import { uploadFile } from '@/scripts/upload';

export function chooseFileFromPc(multiple: boolean, keepOriginal = false): Promise<DriveFile[]> {
	return new Promise((res, rej) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = multiple;
		input.onchange = () => {
			const promises = Array.from(input.files).map(file => uploadFile(file, defaultStore.state.uploadFolder, undefined, keepOriginal));

			Promise.all(promises).then(driveFiles => {
				res(driveFiles);
			}).catch(err => {
				// アップロードのエラーは uploadFile 内でハンドリングされているためアラートダイアログを出したりはしてはいけない
			});

			// 一応廃棄
			(window as any).__misskey_input_ref__ = null;
		};

		// https://qiita.com/fukasawah/items/b9dc732d95d99551013d
		// iOS Safari で正常に動かす為のおまじない
		(window as any).__misskey_input_ref__ = input;

		input.click();
	});
}

export function chooseFileFromDrive(multiple: boolean): Promise<DriveFile[]> {
	return new Promise((res, rej) => {
		os.selectDriveFile(multiple).then(files => {
			res(files);
		});
	});
}


function select(src: any, label: string | null, multiple: boolean): Promise<DriveFile[]> {
	return new Promise((res, rej) => {
		const keepOriginal = ref(defaultStore.state.keepOriginalUploading);

		os.popupMenu([label ? {
			text: label,
			type: 'label',
		} : undefined, {
			type: 'switch',
			text: i18n.ts.keepOriginalUploading,
			ref: keepOriginal,
		}, {
			text: i18n.ts.upload,
			icon: 'ti ti-upload',
			action: () => chooseFileFromPc(multiple, keepOriginal.value).then(files => res(files)),
		}, {
			text: i18n.ts.fromDrive,
			icon: 'ti ti-cloud',
			action: () => chooseFileFromDrive(multiple).then(files => res(files)),
		}], src);
	});
}

export function selectFile(src: any, label: string | null = null): Promise<DriveFile> {
	return select(src, label, false).then(files => files[0]);
}

export function selectFiles(src: any, label: string | null = null): Promise<DriveFile[]> {
	return select(src, label, true);
}
