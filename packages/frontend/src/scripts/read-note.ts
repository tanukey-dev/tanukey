import Dexie from 'dexie';

const SCHEMA_VERSION = 2;

export class ReadNote {
	key: string;
	lastShowDate: Date;
	constructor(key: string, lastShowDate: Date) {
		this.key = key;
		this.lastShowDate = lastShowDate;
	}
}

interface ReadNoteDb extends Dexie {
	readNote: Dexie.Table<ReadNote, string> 
}

const dexieDb = new Dexie('readNote-database') as ReadNoteDb;
dexieDb.version(SCHEMA_VERSION).stores({
	readNote: 'key',
});

export class ReadNoteCache {
	async claerOldData(): Promise<void> {
		//1ヶ月たったデータはクリア
		dexieDb.readNote
			.filter(rn => {
				const clearDate = rn.lastShowDate;
				clearDate.setMonth(clearDate.getMonth() + 1);
				return new Date() > clearDate;
			})
			.delete();
	}

	async get(key: string): Promise<ReadNote | undefined> {
		return dexieDb.readNote
			.get(key)
			.then(async (count: ReadNote | undefined) => {
				return count;
			})
			.catch((error) => {
				throw new Error(`Error getting already read note:, ${error}`);
			});
	}

	async put(readNote: ReadNote): Promise<ReadNote | undefined> {
		await dexieDb.readNote.put(readNote);
		return await this.get(readNote.key);
	}
}

export const readNoteCache = new ReadNoteCache();
