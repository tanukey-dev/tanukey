import { URLSearchParams } from 'node:url';
import { Inject, Injectable } from '@nestjs/common';
import type { NotesRepository } from '@/models/index.js';
import { Endpoint } from '@/server/api/endpoint-base.js';
import type { Config } from '@/config.js';
import { DI } from '@/di-symbols.js';
import { NoteEntityService } from '@/core/entities/NoteEntityService.js';
import { MetaService } from '@/core/MetaService.js';
import { HttpRequestService } from '@/core/HttpRequestService.js';
import { GetterService } from '@/server/api/GetterService.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['notes'],

	requireCredential: true,
	kind: 'read:account',

	res: {
		type: 'object',
		optional: false, nullable: false,
	},

	errors: {
		noSuchNote: {
			message: 'No such note.',
			code: 'NO_SUCH_NOTE',
			id: 'bea9b03f-36e0-49c5-a4db-627a029f8971',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		noteId: { type: 'string', format: 'misskey:id' },
		targetLang: { type: 'string' },
	},
	required: ['noteId', 'targetLang'],
} as const;

// eslint-disable-next-line import/no-default-export
@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> {
	constructor(
		@Inject(DI.config)
		private config: Config,
	
		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		private noteEntityService: NoteEntityService,
		private getterService: GetterService,
		private metaService: MetaService,
		private httpRequestService: HttpRequestService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const note = await this.getterService.getNote(ps.noteId).catch(err => {
				if (err.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new ApiError(meta.errors.noSuchNote);
				throw err;
			});

			if (!(await this.noteEntityService.isVisibleForMe(note, me ? me.id : null))) {
				return 204; // TODO: 良い感じのエラー返す
			}

			if (note.text == null) {
				return 204;
			}

			const instance = await this.metaService.fetch();

			if (instance.deeplAuthKey == null) {
				return 204; // TODO: 良い感じのエラー返す
			}

			let targetLang = ps.targetLang;
			if (targetLang.includes('-')) targetLang = targetLang.split('-')[0];

			const params = new URLSearchParams();
			params.append('auth_key', instance.deeplAuthKey);
			params.append('text', note.text);
			params.append('target_lang', targetLang);

			const endpoint = instance.deeplIsPro ? 'https://api.deepl.com/v2/translate' : 'https://api-free.deepl.com/v2/translate';

			const res = await this.httpRequestService.send(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					Accept: 'application/json, */*',
				},
				body: params.toString(),
			});

			const json = (await res.json()) as {
				translations: {
					detected_source_language: string;
					text: string;
				}[];
			};

			return {
				sourceLang: json.translations[0].detected_source_language,
				text: json.translations[0].text,
			};
		});
	}
}
