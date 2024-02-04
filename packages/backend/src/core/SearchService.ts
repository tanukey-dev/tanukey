import { Inject, Injectable } from '@nestjs/common';
import { In, Brackets } from 'typeorm';
import { Client as ElasticSearch } from '@elastic/elasticsearch';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import { bindThis } from '@/decorators.js';
import { Note } from '@/models/entities/Note.js';
import { User } from '@/models/index.js';
import type { NotesRepository } from '@/models/index.js';
import { sqlLikeEscape } from '@/misc/sql-like-escape.js';
import { QueryService } from '@/core/QueryService.js';
import { IdService } from '@/core/IdService.js';

type K = string;
type V = string | number | boolean;
type Q =
	{ op: '=', k: K, v: V } |
	{ op: '!=', k: K, v: V } |
	{ op: '>', k: K, v: number } |
	{ op: '<', k: K, v: number } |
	{ op: '>=', k: K, v: number } |
	{ op: '<=', k: K, v: number } |
	{ op: 'and', qs: Q[] } |
	{ op: 'or', qs: Q[] } |
	{ op: 'not', q: Q };

function compileValue(value: V): string {
	if (typeof value === 'string') {
		return `'${value}'`; // TODO: escape
	} else if (typeof value === 'number') {
		return value.toString();
	} else if (typeof value === 'boolean') {
		return value.toString();
	}
	throw new Error('unrecognized value');
}

function compileQuery(q: Q): string {
	switch (q.op) {
		case '=': return `(${q.k} = ${compileValue(q.v)})`;
		case '!=': return `(${q.k} != ${compileValue(q.v)})`;
		case '>': return `(${q.k} > ${compileValue(q.v)})`;
		case '<': return `(${q.k} < ${compileValue(q.v)})`;
		case '>=': return `(${q.k} >= ${compileValue(q.v)})`;
		case '<=': return `(${q.k} <= ${compileValue(q.v)})`;
		case 'and': return q.qs.length === 0 ? '' : `(${ q.qs.map(_q => compileQuery(_q)).join(' AND ') })`;
		case 'or': return q.qs.length === 0 ? '' : `(${ q.qs.map(_q => compileQuery(_q)).join(' OR ') })`;
		case 'not': return `(NOT ${compileQuery(q.q)})`;
		default: throw new Error('unrecognized query operator');
	}
}

@Injectable()
export class SearchService {
	private elasticsearchNoteIndex: string | null = null;

	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.elasticsearch)
		private elasticsearch: ElasticSearch | null,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		private queryService: QueryService,
		private idService: IdService,
	) {
		if (this.elasticsearch) {
			const indexName = `${config.elasticsearch!.index}---notes`;
			this.elasticsearchNoteIndex = indexName;
		
			this.elasticsearch.indices.exists({
				index: indexName,
			}).then((indexExists: any) => {
				if (!indexExists) {
					this.elasticsearch?.indices.create({
						index: indexName,
						body: {
							mappings: {
								properties: {
									text: { type: 'text' },
									cw: { type: 'text' },
									createdAt: { type: 'long' },
									userId: { type: 'keyword' },
									userHost: { type: 'keyword' },
									channelId: { type: 'keyword' },
									tags: { type: 'keyword' },
								},
							},
							settings: {
								//TODO: Make settings for optimization.
							},
						},
					}).catch((error: any) => {
						console.error(error);
					});
				} else {
					console.log(`Index ${indexName} already exists`);
				}
			}).catch((error: any) => {
				console.error(error);
			});
		} else {
			console.error('Elasticsearch is not available');
			this.elasticsearchNoteIndex = null;
		}
	}

	@bindThis
	public async indexNote(note: Note): Promise<void> {
		if (note.text == null && note.cw == null) return;
		if (!['home', 'public'].includes(note.visibility)) return;

		if (this.elasticsearch) {
			const body = {
				createdAt: this.idService.parse(note.id).date.getTime(),
				userId: note.userId,
				userHost: note.userHost,
				channelId: note.channelId,
				cw: note.cw,
				text: note.text,
				tags: note.tags,
			};

			console.log(body);
			console.log(this.elasticsearchNoteIndex);

			await this.elasticsearch.index({
				index: this.elasticsearchNoteIndex as string,
				id: note.id,
				body: body,
			});
		}
	}

	public async unindexNote(note: Note): Promise<void> {
		if (!['home', 'public'].includes(note.visibility)) return;

		if (this.elasticsearch) {
			(this.elasticsearch.delete)({
				index: this.elasticsearchNoteIndex as string,
				id: note.id,
			});
		}
	}

	@bindThis
	public async searchNote(q: string, me: User | null, opts: {
		userId?: Note['userId'] | null;
		channelId?: Note['channelId'] | null;
		host?: string | null;
		origin?: string;
		checkChannelSearchable?: boolean;
	}, pagination: {
		untilId?: Note['id'];
		sinceId?: Note['id'];
		limit?: number;
	}): Promise<Note[]> {
		if (this.elasticsearch) {
			const esFilter: any = {
				bool: {
					must: [],
				},
			};
			if (pagination.untilId) esFilter.bool.must.push({ range: { createdAt: { lt: this.idService.parse(pagination.untilId).date.getTime() } } });
			if (pagination.sinceId) esFilter.bool.must.push({ range: { createdAt: { gt: this.idService.parse(pagination.sinceId).date.getTime() } } });
			if (opts.userId) esFilter.bool.must.push({ term: { userId: opts.userId } });
			if (opts.channelId) esFilter.bool.must.push({ term: { channelId: opts.channelId } });
			if (opts.host) {
				if (opts.host === '.') {
					esFilter.bool.must.push({ bool: { must_not: [{ exists: { field: 'userHost' } }] } });
				} else {
					esFilter.bool.must.push({ term: { userHost: opts.host } });
				}
			}
			const res = await (this.elasticsearch.search)({
				index: this.elasticsearchNoteIndex as string,
				body: {
					query: {
						bool: {
							must: [
								{ wildcard: { "text": { value: `*${q}*` }, } },
								esFilter,
							]
						},
					},
				},
				sort: [{ createdAt: { order: "desc" } }],
				_source: ['id', 'createdAt'],
				size: pagination.limit,
				
			});
			const noteIds = res.hits.hits.map((hit: any) => hit._id);
			if (noteIds.length === 0) return [];
			const notes = (await this.notesRepository.findBy({
				id: In(noteIds),
			}));
			//TODO
			//.filter(note => {
			// 	if (me && isUserRelated(note, userIdsWhoBlockingMe)) return false;
			// 	if (me && isUserRelated(note, userIdsWhoMeMuting)) return false;
			// 	return true;
			// });
			return notes.sort((a, b) => a.id > b.id ? -1 : 1);
		} else {
			const query = this.queryService.makePaginationQuery(this.notesRepository.createQueryBuilder('note'), pagination.sinceId, pagination.untilId);

			if (opts.origin === 'local') {
				query.andWhere('note.userHost IS NULL');
			} else if (opts.origin === 'remote') {
				query.andWhere('note.userHost IS NOT NULL');
			}

			if (opts.userId) {
				query.andWhere('note.userId = :userId', { userId: opts.userId });
			} else if (opts.channelId) {
				query.andWhere('note.channelId = :channelId', { channelId: opts.channelId });
			}

			if (opts.checkChannelSearchable) {
				query
					.leftJoinAndSelect('note.channel', 'channel')
					.andWhere(new Brackets(qb => {
						qb.orWhere('channel.searchable IS NULL');
						qb.orWhere('channel.searchable = true');
					}));
			}

			query
				.andWhere('note.text ILIKE :q', { q: `%${ sqlLikeEscape(q) }%` })
				.innerJoinAndSelect('note.user', 'user')
				.leftJoinAndSelect('note.reply', 'reply')
				.leftJoinAndSelect('note.renote', 'renote')
				.leftJoinAndSelect('reply.user', 'replyUser')
				.leftJoinAndSelect('renote.user', 'renoteUser');

			this.queryService.generateVisibilityQuery(query, me);
			if (me) this.queryService.generateMutedUserQuery(query, me);
			if (me) this.queryService.generateBlockedUserQuery(query, me);

			return await query.take(pagination.limit).getMany();
		}
	}
}
