import { miLocalStorage } from '@/local-storage';
import * as os from '@/os';

export async function openPostForm() {
	let channel: any = null;

	const paths = location.href.split('/');
	if (paths.length > 4) {
		if (paths[3] === 'channels') {
			channel = await os.api('channels/show', {
				channelId: paths[4],
			});
		}
	} else {
		const channelId: string|null = miLocalStorage.getItem('postChannel');
		if (channelId) {
			channel = await os.api('channels/show', {
				channelId: channelId,
			});
		}
	}

	os.post({
		channel: channel,
	});
}
