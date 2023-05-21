import * as os from '@/os';
import { unisonReload } from '@/scripts/unison-reload';
import { readNoteCache } from '@/scripts/read-note';
import { miLocalStorage } from '@/local-storage';
import { fetchCustomEmojis } from '@/custom-emojis';

export async function clearCache(): Promise<void> {
	os.waiting();
	miLocalStorage.removeItem('locale');
	miLocalStorage.removeItem('theme');
	miLocalStorage.removeItem('emojis');
	miLocalStorage.removeItem('lastEmojisFetchedAt');
	await readNoteCache.claerOldData();
	await fetchCustomEmojis(true);
	unisonReload();
}
