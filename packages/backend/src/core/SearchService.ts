import type { Config } from "@/config.js";
import { IdService } from "@/core/IdService.js";
import type { LoggerService } from "@/core/LoggerService.js";
import { QueryService } from "@/core/QueryService.js";
import type NotesChart from "@/core/chart/charts/notes.js";
import { bindThis } from "@/decorators.js";
import { DI } from "@/di-symbols.js";
import type Logger from "@/logger.js";
import { Note } from "@/models/entities/Note.js";
import { User } from "@/models/index.js";
import type { NotesRepository } from "@/models/index.js";
import { Inject, Injectable } from "@nestjs/common";
import { Client as OpenSearch } from "@opensearch-project/opensearch";
import { Brackets, In, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

@Injectable()
export class SearchService {
	private opensearchNoteIndex: string | null = null;
	private isIndexing = false;
	private notesCount = 0;
	private index = 0;
	private indexingError = false;
	private logger: Logger;

	constructor(
		@Inject(DI.config)
		private config: Config,

		@Inject(DI.opensearch)
		private opensearch: OpenSearch | null,

		@Inject(DI.notesRepository)
		private notesRepository: NotesRepository,

		private queryService: QueryService,
		private idService: IdService,

		@Inject(DI.notesChart)
		private notesChart: NotesChart,

		@Inject(DI.loggerService)
		private loggerService: LoggerService,
	) {
		this.logger = this.loggerService.getLogger("search");

		if (this.opensearch) {
			const indexName = `${config.opensearch!.index}---notes`;
			this.opensearchNoteIndex = indexName;

			this.opensearch.indices
				.exists({
					index: indexName,
				})
				.then((indexExists: any) => {
					if (!indexExists) {
						this.opensearch?.indices
							.create({
								index: indexName,
								body: {
									mappings: {
										properties: {
											text: { type: "text" },
											cw: { type: "text" },
											createdAt: { type: "long" },
											userId: { type: "text" },
											userHost: { type: "text" },
											channelId: { type: "text" },
											tags: { type: "text" },
											replyId: { type: "text" },
											renoteId: { type: "text" },
											visibility: { type: "text" },
											visibleUserIds: { type: "text" },
											hasFile: { type: "boolean" },
										},
									},
									// see: https://aws.amazon.com/jp/blogs/psa/amazon-opensearch-service-sudachi-plugin/
									settings: {
										index: {
											analysis: {
												tokenizer: {
													sudachi_c_tokenizer: {
														type: "sudachi_tokenizer",
														additional_settings:
															"{'systemDict':'system_core.dic'}",
														split_mode: "C",
														discard_punctuation: true,
													},
													sudachi_a_tokenizer: {
														type: "sudachi_tokenizer",
														additional_settings:
															"{'systemDict':'system_core.dic'}",
														split_mode: "A",
														discard_punctuation: true,
													},
												},
												analyzer: {
													c_analyzer: {
														filter: [],
														tokenizer: "sudachi_c_tokenizer",
														type: "custom",
													},
													a_normalizedform_analyzer: {
														filter: ["sudachi_normalizedform"],
														tokenizer: "sudachi_a_tokenizer",
														type: "custom",
													},
												},
											},
										},
									},
								},
							})
							.catch((error: any) => {
								console.error(error);
							});
					} else {
						console.log(`Index ${indexName} already exists`);
						this.opensearch?.indices
							.putMapping({
								index: indexName,
								body: {
									properties: {
										text: { type: "text" },
										cw: { type: "text" },
										createdAt: { type: "long" },
										userId: { type: "text" },
										userHost: { type: "text" },
										channelId: { type: "text" },
										tags: { type: "text" },
										replyId: { type: "text" },
										renoteId: { type: "text" },
										visibility: { type: "text" },
										visibleUserIds: { type: "text" },
										hasFile: { type: "boolean" },
									},
								},
							})
							.catch((error: any) => {
								console.error(error);
							});
					}
				})
				.catch((error: any) => {
					console.error(error);
				});
		} else {
			console.error("OpenSearch is not available");
			this.opensearchNoteIndex = null;
		}
	}

	@bindThis
	public async indexNote(
		note: Note,
		refresh: boolean,
		callback: () => void,
	): Promise<void> {
		if (this.opensearch) {
			const body = {
				createdAt: this.idService.parse(note.id).date.getTime(),
				userId: note.userId,
				userHost: note.userHost,
				channelId: note.channelId,
				cw: note.cw,
				text: note.text,
				tags: note.tags,
				replyId: note.replyId,
				renoteId: note.renoteId,
				visibility: note.visibility,
				visibleUserIds: note.visibleUserIds,
				hasFile: note.fileIds.length !== 0,
			};

			this.opensearch.index(
				{
					index: this.opensearchNoteIndex as string,
					id: note.id,
					refresh: refresh ? "wait_for" : false,
					body: body,
				},
				() => {
					callback();
				},
			);
		}
	}

	@bindThis
	public getFullIndexingStats(): {
		running: boolean;
		total: number;
		index: number;
		indexingError: boolean;
	} {
		return {
			running: this.isIndexing,
			total: this.notesCount,
			index: this.index,
			indexingError: this.indexingError,
		};
	}

	private async stepFullIndex(
		lastId: string | null,
		take: number,
	): Promise<string | null> {
		const query = this.notesRepository
			.createQueryBuilder("note")
			.where("note.userHost IS NULL");

		if (lastId) {
			query.andWhere("note.id > :minId", { minId: lastId });
		}

		let notes: Note[] = [];
		try {
			notes = await query.orderBy("note.id").limit(take).getMany();
		} catch (e) {
			this.logger.error(`get note error: ${take}`);
			throw e;
		}

		if (notes.length === 0) return null;

		let tmplastId = null;
		for (const note of notes) {
			try {
				this.indexNote(note, false, () => {});
			} catch (e) {
				this.logger.error(`index note error: ${note.id}`);
				throw e;
			}
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

				const notesChart = await this.notesChart.getChart("hour", 1, null);
				this.notesCount = notesChart.local.total[0];

				let lastId = null;
				for (this.index = 0; ; this.index = this.index + take) {
					lastId = await this.stepFullIndex(lastId, take);
					if (lastId === null) break;
				}
			} catch (e) {
				this.indexingError = true;
				this.logger.error("full index error");
			} finally {
				this.isIndexing = false;
			}
		}
	}

	public async unindexNote(note: Note): Promise<void> {
		if (this.opensearch) {
			this.opensearch.delete({
				index: this.opensearchNoteIndex as string,
				id: note.id,
			});
		}
	}

	@bindThis
	public getFilter(
		q: string,
		opts: {
			userIds?: Note["userId"][] | null;
			channelId?: Note["channelId"] | null;
			keywords?: string[][];
			excludeKeywords?: string[][];
			origin?: string;
			checkChannelSearchable?: boolean;
			createAtBegin?: number;
			createAtEnd?: number;
			reverseOrder?: boolean;
			hasFile?: boolean;
			includeReplies?: boolean;
			tags?: string[];
		},
		pagination: {
			equal?: Note["id"];
			untilId?: Note["id"];
			sinceId?: Note["id"];
			limit?: number;
		},
	) {
		const esFilter: any = { bool: { must: [] } };
		if (pagination.equal) {
			esFilter.bool.must.push({
				term: {
					createdAt: this.idService.parse(pagination.equal).date.getTime(),
				},
			});
		} else if (opts.reverseOrder) {
			if (pagination.untilId)
				esFilter.bool.must.push({
					range: {
						createdAt: {
							gt: this.idService.parse(pagination.untilId).date.getTime(),
						},
					},
				});
			if (pagination.sinceId)
				esFilter.bool.must.push({
					range: {
						createdAt: {
							lt: this.idService.parse(pagination.sinceId).date.getTime(),
						},
					},
				});
		} else {
			if (pagination.untilId)
				esFilter.bool.must.push({
					range: {
						createdAt: {
							lt: this.idService.parse(pagination.untilId).date.getTime(),
						},
					},
				});
			if (pagination.sinceId)
				esFilter.bool.must.push({
					range: {
						createdAt: {
							gt: this.idService.parse(pagination.sinceId).date.getTime(),
						},
					},
				});
		}
		if (opts.userIds && opts.userIds.length > 0) {
			esFilter.bool.must.push({
				bool: {
					should: [
						...opts.userIds.map((id) => {
							return { term: { userId: id } };
						}),
					],
				},
			});
		}
		if (opts.channelId)
			esFilter.bool.must.push({ term: { channelId: opts.channelId } });
		if (opts.origin === "local") {
			esFilter.bool.must.push({
				bool: { must_not: [{ exists: { field: "userHost" } }] },
			});
		} else if (opts.origin === "remote") {
			esFilter.bool.must.push({
				bool: { must: [{ exists: { field: "userHost" } }] },
			});
		}
		if (opts.createAtBegin && opts.createAtEnd) {
			esFilter.bool.must.push({
				range: {
					createdAt: { gte: opts.createAtBegin, lte: opts.createAtEnd },
				},
			});
		} else if (opts.createAtBegin) {
			esFilter.bool.must.push({
				range: { createdAt: { gte: opts.createAtBegin } },
			});
		} else if (opts.createAtEnd) {
			esFilter.bool.must.push({
				range: { createdAt: { lte: opts.createAtEnd } },
			});
		}

		if (q !== "") {
			esFilter.bool.must.push({
				bool: {
					should: [
						{ wildcard: { text: { value: q } } },
						{
							simple_query_string: {
								fields: ["text"],
								query: q,
								default_operator: "and",
							},
						},
						{ wildcard: { cw: { value: q } } },
						{
							simple_query_string: {
								fields: ["cw"],
								query: q,
								default_operator: "and",
							},
						},
					],
					minimum_should_match: 1,
				},
			});
		}

		if (opts.keywords && opts.keywords.length > 0) {
			const keywordsList = opts.keywords
				// Clean up
				.map((xs) => xs.filter((x) => x !== ""))
				.filter((xs) => xs.length > 0);

			if (keywordsList.length > 0) {
				const filter = {
					bool: {
						should: [] as any[],
						minimum_should_match: 1,
					},
				};

				for (const keywords of keywordsList) {
					const word = keywords.join(" ");
					filter.bool.should.push({ wildcard: { text: { value: word } } });
					filter.bool.should.push({
						simple_query_string: {
							fields: ["text"],
							query: word,
							default_operator: "and",
						},
					});
					filter.bool.should.push({ wildcard: { cw: { value: word } } });
					filter.bool.should.push({
						simple_query_string: {
							fields: ["cw"],
							query: word,
							default_operator: "and",
						},
					});
				}

				esFilter.bool.must.push(filter);
			}
		}

		if (opts.excludeKeywords && opts.excludeKeywords.length > 0) {
			const excludeKeywordsList = opts.excludeKeywords
				// Clean up
				.map((xs) => xs.filter((x) => x !== ""))
				.filter((xs) => xs.length > 0);

			if (excludeKeywordsList.length > 0) {
				const filter = {
					bool: {
						must_not: {
							bool: {
								should: [] as any[],
								minimum_should_match: 1,
							},
						},
					},
				};

				for (const keywords of excludeKeywordsList) {
					const word = keywords.join(" ");
					filter.bool.must_not.bool.should.push({
						wildcard: { text: { value: word } },
					});
					filter.bool.must_not.bool.should.push({
						simple_query_string: {
							fields: ["text"],
							query: word,
							default_operator: "and",
						},
					});
					filter.bool.must_not.bool.should.push({
						wildcard: { cw: { value: word } },
					});
					filter.bool.must_not.bool.should.push({
						simple_query_string: {
							fields: ["cw"],
							query: word,
							default_operator: "and",
						},
					});
				}

				esFilter.bool.must.push(filter);
			}
		}

		if (opts.hasFile) {
			esFilter.bool.must.push({
				bool: { must: [{ term: { hasFile: true } }] },
			});
		}

		if (!opts.includeReplies) {
			esFilter.bool.must.push({
				bool: { must_not: [{ exists: { field: "replyId" } }] },
			});
		}

		if (opts.tags && opts.tags.length > 0) {
			esFilter.bool.must.push({
				bool: {
					should: [
						...opts.tags.map((tag) => {
							return { wildcard: { tags: { value: tag } } };
						}),
					],
				},
			});
		}

		return esFilter;
	}

	@bindThis
	public async searchNote(
		q: string,
		me: User | null,
		opts: {
			userIds?: Note["userId"][] | null;
			channelId?: Note["channelId"] | null;
			keywords?: string[][];
			excludeKeywords?: string[][];
			origin?: string;
			checkChannelSearchable?: boolean;
			createAtBegin?: number;
			createAtEnd?: number;
			reverseOrder?: boolean;
			hasFile?: boolean;
			includeReplies?: boolean;
		},
		pagination: {
			equal?: Note["id"];
			untilId?: Note["id"];
			sinceId?: Note["id"];
			limit?: number;
		},
	): Promise<Note[]> {
		if (!this.opensearch) {
			return [];
		}

		const esFilter = this.getFilter(
			q,
			{
				userIds: opts.userIds,
				channelId: opts.channelId,
				keywords: opts.keywords,
				excludeKeywords: opts.excludeKeywords,
				origin: opts.origin,
				checkChannelSearchable: opts.checkChannelSearchable,
				createAtBegin: opts.createAtBegin,
				createAtEnd: opts.createAtEnd,
				reverseOrder: opts.reverseOrder,
				hasFile: opts.hasFile,
				includeReplies: opts.includeReplies,
			},
			{
				equal: pagination.equal,
				untilId: pagination.untilId,
				sinceId: pagination.sinceId,
				limit: pagination.limit,
			},
		);

		return this.searchNoteWithFilter(
			me,
			[esFilter],
			opts.checkChannelSearchable,
			opts.reverseOrder,
			pagination.limit,
		);
	}

	@bindThis
	public async searchNoteWithFilter(
		me: User | null,
		esFilters: any[],
		checkChannelSearchable?: boolean,
		reverseOrder?: boolean,
		limit?: number,
	): Promise<Note[]> {
		if (!this.opensearch) {
			return [];
		}

		let filter: any;
		if (esFilters.length === 1) {
			filter = esFilters[0];
		} else {
			filter = { bool: { should: [], minimum_should_match: 1 } };
			for (const f of esFilters) {
				filter.bool.should.push(f);
			}
		}

		console.log(JSON.stringify(filter, null, 2));

		const res = await this.opensearch.search({
			index: this.opensearchNoteIndex as string,
			body: {
				query: filter,
				sort: [
					{
						createdAt: {
							order:
								reverseOrder !== undefined && !reverseOrder ? "desc" : "asc",
						},
					},
				],
			},
			_source: ["id", "createdAt"],
			size: limit,
		});

		const noteIds = res.body.hits.hits.map((hit: any) => hit._id);
		if (noteIds.length === 0) return [];

		const query = this.notesRepository.createQueryBuilder("note");
		query.andWhereInIds(noteIds);

		if (checkChannelSearchable) {
			query.leftJoinAndSelect("note.channel", "channel").andWhere(
				new Brackets((qb) => {
					qb.orWhere("channel.searchable IS NULL");
					qb.orWhere("channel.searchable = true");
				}),
			);
		}

		query
			.innerJoinAndSelect("note.user", "user")
			.leftJoinAndSelect("note.reply", "reply")
			.leftJoinAndSelect("note.renote", "renote")
			.leftJoinAndSelect("reply.user", "replyUser")
			.leftJoinAndSelect("renote.user", "renoteUser");

		this.queryService.generateVisibilityQuery(query, me);
		if (me) this.queryService.generateMutedUserQuery(query, me);
		if (me) this.queryService.generateBlockedUserQuery(query, me);

		query.orderBy(
			"note.createdAt",
			reverseOrder !== undefined && !reverseOrder ? "DESC" : "ASC",
		);

		return await query.limit(limit).getMany();
	}
}
