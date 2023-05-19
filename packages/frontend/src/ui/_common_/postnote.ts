import { miLocalStorage } from '@/local-storage';
import * as os from '@/os';

export async function openPostForm() {
	const channelId: string|null = miLocalStorage.getItem('postChannel');

	let channel: any = null;
	if (channelId) {
		channel = await os.api('channels/show', {
			channelId: channelId,
		});
	}

	os.post({
		channel: channel,
	});
}
