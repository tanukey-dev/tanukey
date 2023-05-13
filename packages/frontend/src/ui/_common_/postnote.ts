import * as os from '@/os';

export async function openPostForm() {
	//チャンネルページを開いている場合はチャンネルに投稿
	const paths = location.href.split('/');
	let channel: any = null;
	if (paths.length > 4) {
		if (paths[3] === 'channels') {
			channel = await os.api('channels/show', {
				channelId: paths[4],
			});
		}
	}
	os.post({
		channel: channel,
	});
}
