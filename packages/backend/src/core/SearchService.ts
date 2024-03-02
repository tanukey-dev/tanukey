import { Inject, Injectable } from '@nestjs/common';
import { In, Brackets, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Client as OpenSearch } from '@opensearch-project/opensearch';
import { DI } from '@/di-symbols.js';
import type { Config } from '@/config.js';
import { bindThis } from '@/decorators.js';
import { Note } from '@/models/entities/Note.js';
import { User } from '@/models/index.js';
import type { NotesRepository, UsersRepository } from '@/models/index.js';
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
	private opensearchNoteIndex: string | null = null;
	private isIndexing = false;
	private notesCount = 0;
	private index = 0;
	private indexingError = false;

	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.opensearch)
		private opensearch: OpenSearch | null,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		private queryService: QueryService,
		private idService: IdService,
	) {
		if (this.opensearch) {
			const indexName = `${config.opensearch!.index}---notes`;
			this.opensearchNoteIndex = indexName;
		
			this.opensearch.indices.exists({
				index: indexName,
			}).then((indexExists: any) => {
				if (!indexExists) {
					this.opensearch?.indices.create({
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
								},
							},
							// see: https://aws.amazon.com/jp/blogs/psa/amazon-opensearch-service-sudachi-plugin/
							settings: {
								index: {
									analysis: {
										tokenizer: {
											sudachi_c_tokenizer: {
												type: 'sudachi_tokenizer',
												additional_settings: '{\'systemDict\':\'system_core.dic\'}',
												split_mode: 'C',
												discard_punctuation: true,
											},
											sudachi_a_tokenizer: {
												type: 'sudachi_tokenizer',
												additional_settings: '{\'systemDict\':\'system_core.dic\'}',
												split_mode: 'A',
												discard_punctuation: true,
											},
										},
										analyzer: {
											c_analyzer: {
												filter: [],
												tokenizer: 'sudachi_c_tokenizer',
												type: 'custom',
											},
											a_normalizedform_analyzer: {
												filter: ['sudachi_normalizedform'],
												tokenizer: 'sudachi_a_tokenizer',
												type: 'custom',
											},
										},
									},
								},
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
			console.error('OpenSearch is not available');
			this.opensearchNoteIndex = null;
		}
	}

	@bindThis
	public async indexNote(note: Note): Promise<void> {
		if (this.opensearch) {
			const body = {
				createdAt: this.idService.parse(note.id).date.getTime(),
				userId: note.userId,
				userHost: note.userHost,
				channelId: note.channelId,
				cw: note.cw,
				text: note.text,
			};

			await this.opensearch.index({
				index: this.opensearchNoteIndex as string,
				id: note.id,
				body: body,
			}).catch(e => {
				console.error('index error: ' + note.id);
			});
		}
	}

	@bindThis
	public getFullIndexingStats(): { running: boolean, total: number, index: number, indexingError: boolean } {
		return { running: this.isIndexing, total: this.notesCount, index: this.index, indexingError: this.indexingError };
	}

	private async stepFullIndex(lastId: string|null, take: number): Promise<string|null> {
		const query = this.notesRepository
			.createQueryBuilder('note')
			.where('note.userHost IS NULL');
		
		if (lastId) {
			query.andWhere('note.id > :minId', { minId: lastId });
		}

		const notes =	await query.orderBy('note.id').limit(take).getMany();

		let tmplastId = null;
		for (const note of notes) {
			this.indexNote(note);
			tmplastId = note.id;
		}

		return tmplastId;
	}

	@bindThis
	public async startFullIndexNote(): Promise<void> {
		if (!this.isIndexing) {
			try {
				const take = 10;
				this.isIndexing = true;
				this.indexingError = false;

				this.notesCount = await this.notesRepository.createQueryBuilder('note')
					.where('note.userHost IS NULL')
					.getCount();

				let lastId = null;
				for (this.index = 0; this.index < this.notesCount; this.index = this.index + take) {
					lastId = await this.stepFullIndex(lastId, take);
				}
			} catch (e) {
				this.indexingError = true;
				console.error('full index error');
			} finally {
				this.isIndexing = false;
			}
		}
	}

	public async unindexNote(note: Note): Promise<void> {
		if (this.opensearch) {
			(this.opensearch.delete)({
				index: this.opensearchNoteIndex as string,
				id: note.id,
			});
		}
	}

	@bindThis
	public async searchNote(q: string, me: User | null, opts: {
		userId?: Note['userId'] | null;
		channelId?: Note['channelId'] | null;
		origin?: string;
		checkChannelSearchable?: boolean;
		createAtBegin?: number;
		createAtEnd?: number;
		reverseOrder?: boolean;
		hasFile?: boolean;
	}, pagination: {
		untilId?: Note['id'];
		sinceId?: Note['id'];
		limit?: number;
	}): Promise<Note[]> {
		if (this.opensearch) {
			const esFilter: any = { bool: { must: [] } };
			if (opts.reverseOrder) {
				if (pagination.untilId) esFilter.bool.must.push({ range: { createdAt: { gt: this.idService.parse(pagination.untilId).date.getTime() } } });
				if (pagination.sinceId) esFilter.bool.must.push({ range: { createdAt: { lt: this.idService.parse(pagination.sinceId).date.getTime() } } });
			} else {
				if (pagination.untilId) esFilter.bool.must.push({ range: { createdAt: { lt: this.idService.parse(pagination.untilId).date.getTime() } } });
				if (pagination.sinceId) esFilter.bool.must.push({ range: { createdAt: { gt: this.idService.parse(pagination.sinceId).date.getTime() } } });
			}
			if (opts.userId) esFilter.bool.must.push({ term: { userId: opts.userId } });
			if (opts.channelId) esFilter.bool.must.push({ term: { channelId: opts.channelId } });
			if (opts.origin === 'local') {
				esFilter.bool.must.push({ bool: { must_not: [{ exists: { field: 'userHost' } }] } });
			} else if (opts.origin === 'remote') {
				esFilter.bool.must.push({ bool: { must: [{ exists: { field: 'userHost' } }] } });
			}
			if (opts.createAtBegin && opts.createAtEnd) {
				esFilter.bool.must.push({ range: { createdAt: { gte: opts.createAtBegin, lte: opts.createAtEnd } } });
			} else if (opts.createAtBegin) {
				esFilter.bool.must.push({ range: { createdAt: { gte: opts.createAtBegin } } });
			} else if (opts.createAtEnd) {
				esFilter.bool.must.push({ range: { createdAt: { lte: opts.createAtEnd } } });
			}

			if (q !== '') {
				esFilter.bool.must.push({
					bool: {
						should: [
							{ wildcard: { 'text': { value: q } } },
							{ simple_query_string: { fields: ['text'], 'query': q, default_operator: 'and' } },
							{ wildcard: { 'cw': { value: q } } },
							{ simple_query_string: { fields: ['cw'], 'query': q, default_operator: 'and' } },
						],
						minimum_should_match: 1,
					},
				});
			}

			const res = await (this.opensearch.search)({
				index: this.opensearchNoteIndex as string,
				body: {
					query: esFilter,
					sort: [
						{
							createdAt: {
								order: opts.reverseOrder !== undefined && !opts.reverseOrder ? 'desc' : 'asc',
							},
						},
					],
				},
				_source: ['id', 'createdAt'],
				size: pagination.limit,
			});
			const noteIds = res.body.hits.hits.map((hit: any) => hit._id);
			if (noteIds.length === 0) return [];

			const query = this.notesRepository.createQueryBuilder('note');
			query.andWhereInIds(noteIds);

			if (opts.checkChannelSearchable) {
				query
					.leftJoinAndSelect('note.channel', 'channel')
					.andWhere(new Brackets(qb => {
						qb.orWhere('channel.searchable IS NULL');
						qb.orWhere('channel.searchable = true');
					}));
			}

			if (opts.hasFile) {
				query.andWhere('note.fileIds != \'{}\'');
			}

			query
				.innerJoinAndSelect('note.user', 'user')
				.leftJoinAndSelect('note.reply', 'reply')
				.leftJoinAndSelect('note.renote', 'renote')
				.leftJoinAndSelect('reply.user', 'replyUser')
				.leftJoinAndSelect('renote.user', 'renoteUser');

			this.queryService.generateVisibilityQuery(query, me);
			if (me) this.queryService.generateMutedUserQuery(query, me);
			if (me) this.queryService.generateBlockedUserQuery(query, me);

			query.orderBy('note.createdAt', opts.reverseOrder !== undefined && !opts.reverseOrder ? 'DESC' : 'ASC');

			return await query.limit(pagination.limit).getMany();
		} else {
			const query = opts.reverseOrder
				? this.queryService.makePaginationQuery(this.notesRepository.createQueryBuilder('note'), pagination.untilId, pagination.sinceId)
				: this.queryService.makePaginationQuery(this.notesRepository.createQueryBuilder('note'), pagination.sinceId, pagination.untilId);

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

			if (opts.createAtBegin) query.andWhere('note.createdAt', MoreThanOrEqual(opts.createAtBegin));
			if (opts.createAtEnd) query.andWhere('note.createdAt', LessThanOrEqual(opts.createAtEnd));

			if (opts.hasFile) {
				query.andWhere('note.fileIds != \'{}\'');
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

			query.orderBy('note.createdAt', opts.reverseOrder !== undefined && !opts.reverseOrder ? 'DESC' : 'ASC');

			return await query.limit(pagination.limit).getMany();
		}
	}
}
