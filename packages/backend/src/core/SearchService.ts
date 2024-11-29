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
import type { DriveFileEntityService } from "./entities/DriveFileEntityService.js";

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

		@Inject(DI.driveFileEntityService)
		private driveFileEntityService: DriveFileEntityService,
	) {
		this.logger = this.loggerService.getLogger("search");

		if (this.opensearch) {
			const indexName = `${config.opensearch!.index}---notes`;
			this.opensearchNoteIndex = indexName;

			this.opensearch.indices
				.exists({
					index: indexName,
				})
				.then((response: any) => {
					if (!response?.body) {
						this.opensearch?.indices
							.create({
								index: indexName,
								body: {
									mappings: {
										properties: {
											text: { type: "text" },
											cw: { type: "text" },
											createdAt: { type: "long" },
											userId: { type: "keyword" },
											userHost: { type: "keyword" },
											channelId: { type: "keyword" },
											tags: { type: "keyword" },
											replyId: { type: "keyword" },
											renoteId: { type: "keyword" },
											isQuote: { type: "boolean" },
											renoteText: { type: "text" },
											renoteCw: { type: "text" },
											visibility: { type: "keyword" },
											visibleUserIds: { type: "keyword" },
											hasFile: { type: "boolean" },
											imageTypes: { type: "keyword" },
											imageLabels: { type: "keyword" },
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
															'{"systemDict":"system_core.dic"}',
														split_mode: "C",
														discard_punctuation: true,
													},
													sudachi_a_tokenizer: {
														type: "sudachi_tokenizer",
														additional_settings:
															'{"systemDict":"system_core.dic"}',
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
										userId: { type: "keyword" },
										userHost: { type: "keyword" },
										channelId: { type: "keyword" },
										tags: { type: "keyword" },
										replyId: { type: "keyword" },
										renoteId: { type: "keyword" },
										isQuote: { type: "boolean" },
										renoteText: { type: "text" },
										renoteCw: { type: "text" },
										visibility: { type: "keyword" },
										visibleUserIds: { type: "keyword" },
										hasFile: { type: "boolean" },
										imageTypes: { type: "keyword" },
										imageLabels: { type: "keyword" },
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
			let renote = null;
			const isQuote = (note: Note) => {
				return (
					!!note.renoteId &&
					(!!note.text ||
						!!note.cw ||
						(!!note.fileIds && !!note.fileIds.length) ||
						!!note.hasPoll)
				);
			};
			const isQuoteRenote = isQuote(note);
			if (note.renoteId) {
				renote = await this.notesRepository.findOne({
					where: { id: note.renoteId },
					select: ["text", "cw", "renoteId"],
				});
				// 引用でなくリノートの場合、リノートのさらに先が見えるケースがあるのでそちらで判定する
				if (renote) {
					if (!isQuoteRenote && renote?.renoteId) {
						renote = await this.notesRepository.findOne({
							where: { id: renote.renoteId },
							select: ["text", "cw"],
						});
					}
				}
			}
			const imageTypes = [];
			const imageLabels = [];
			if (note.fileIds.length > 0) {
				const files = await this.driveFileEntityService.packManyByIds(
					note.fileIds,
				);
				for (const file of files) {
					if (file.metadata?.imageType) {
						imageTypes.push(file.metadata.imageType);
					}
					if (file.metadata?.labels) {
						for (const label of file.metadata.labels) {
							imageLabels.push(label);
						}
					}
				}
			}
			const body = {
				createdAt: this.idService.parse(note.id).date.getTime(),
				userId: note.userId,
				userHost: note.userHost,
				channelId: note.channelId,
				cw: note.cw,
				text: note.text,
				tags: note.tags,
				replyId: note.replyId,
				isQuote: isQuoteRenote,
				renoteId: note.renoteId,
				renoteText: renote?.text,
				renoteCw: renote?.cw,
				visibility: note.visibility,
				visibleUserIds: note.visibleUserIds,
				hasFile: note.fileIds.length !== 0,
				imageTypes: imageTypes,
				imageLabels: imageLabels,
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
			excludeUserIds?: Note["userId"][] | null;
			channelId?: Note["channelId"] | null;
			keywords?: string[][];
			excludeKeywords?: string[][];
			origin?: string;
			checkChannelSearchable?: boolean;
			createAtBegin?: number;
			createAtEnd?: number;
			reverseOrder?: boolean;
			excludeRenoteNotQuote?: boolean;
			hasFile?: boolean;
			includeReplies?: boolean;
			tags?: string[];
			imageTypes?: string[];
			imageLabels?: string[];
		},
	) {
		const esFilter: any = { bool: { must: [] } };
		if (opts.userIds && opts.userIds.length > 0) {
			// Clean up
			let userIds = opts.userIds.filter((xs) => xs !== "");
			if (opts.excludeUserIds && opts.excludeUserIds.length > 0) {
				userIds = userIds.filter((xs) => !opts.excludeUserIds?.includes(xs));
			}
			if (userIds.length > 0) {
				esFilter.bool.must.push({
					bool: {
						// _name: "userIds",
						should: [
							...userIds.map((id) => {
								return { term: { userId: id } };
							}),
						],
					},
				});
			}
		}
		if (opts.excludeUserIds && opts.excludeUserIds.length > 0) {
			const excludeUserIds = opts.excludeUserIds.filter((xs) => xs !== "");
			if (excludeUserIds.length > 0) {
				esFilter.bool.must.push({
					bool: {
						// _name: "excludeUserIds",
						must_not: {
							bool: {
								should: [
									...excludeUserIds.map((id) => {
										return { term: { userId: id } };
									}),
								],
								minimum_should_match: 1,
							},
						},
					},
				});
			}
		}
		if (opts.channelId)
			esFilter.bool.must.push({
				// _name: "channelId",
				term: { channelId: opts.channelId },
			});
		if (opts.origin === "local") {
			esFilter.bool.must.push({
				// _name: "origin local only",
				bool: { must_not: [{ exists: { field: "userHost" } }] },
			});
		} else if (opts.origin === "remote") {
			esFilter.bool.must.push({
				// _name: "origin remote only",
				bool: { must: [{ exists: { field: "userHost" } }] },
			});
		}
		if (opts.createAtBegin && opts.createAtEnd) {
			esFilter.bool.must.push({
				// _name: "createdAt range AtBegin and AtEnd",
				range: {
					createdAt: { gte: opts.createAtBegin, lte: opts.createAtEnd },
				},
			});
		} else if (opts.createAtBegin) {
			esFilter.bool.must.push({
				// _name: "createdAt range AtBegin",
				range: { createdAt: { gte: opts.createAtBegin } },
			});
		} else if (opts.createAtEnd) {
			esFilter.bool.must.push({
				// _name: "createdAt range AtEnd",
				range: { createdAt: { lte: opts.createAtEnd } },
			});
		}

		if (q !== "") {
			const fixedQuery = q
				.replaceAll('"', "")
				.replace(/\s+/g, " ")
				.split(" ")
				.map((s) => `"${s}"`)
				.join(" ");
			esFilter.bool.must.push({
				// _name: "query",
				bool: {
					should: [
						{ wildcard: { text: { value: fixedQuery } } },
						{
							simple_query_string: {
								fields: ["text"],
								query: fixedQuery,
								default_operator: "and",
							},
						},
						{ wildcard: { cw: { value: fixedQuery } } },
						{
							simple_query_string: {
								fields: ["cw"],
								query: fixedQuery,
								default_operator: "and",
							},
						},
						{ wildcard: { renoteText: { value: fixedQuery } } },
						{
							simple_query_string: {
								fields: ["renoteText"],
								query: fixedQuery,
								default_operator: "and",
							},
						},
						{ wildcard: { renoteCw: { value: fixedQuery } } },
						{
							simple_query_string: {
								fields: ["renoteCw"],
								query: fixedQuery,
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
					// _name: "keywords",
					bool: {
						must: {
							bool: {
								should: [] as any[],
								minimum_should_match: 1,
							},
						},
					},
				};

				for (const keywords of keywordsList) {
					const fixedQuery = keywords
						.join(" ")
						.replaceAll('"', "")
						.replace(/\s+/g, " ")
						.split(" ")
						.map((s) => `"${s}"`)
						.join(" ");
					filter.bool.must.bool.should.push({
						wildcard: { text: { value: fixedQuery } },
					});
					filter.bool.must.bool.should.push({
						simple_query_string: {
							fields: ["text"],
							query: fixedQuery,
							default_operator: "and",
						},
					});
					filter.bool.must.bool.should.push({
						wildcard: { cw: { value: fixedQuery } },
					});
					filter.bool.must.bool.should.push({
						simple_query_string: {
							fields: ["cw"],
							query: fixedQuery,
							default_operator: "and",
						},
					});
					filter.bool.must.bool.should.push({
						wildcard: { renoteText: { value: fixedQuery } },
					});
					filter.bool.must.bool.should.push({
						simple_query_string: {
							fields: ["renoteText"],
							query: fixedQuery,
							default_operator: "and",
						},
					});
					filter.bool.must.bool.should.push({
						wildcard: { renoteCw: { value: fixedQuery } },
					});
					filter.bool.must.bool.should.push({
						simple_query_string: {
							fields: ["renoteCw"],
							query: fixedQuery,
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
					// _name: "excludeKeywords",
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
					const fixedQuery = keywords
						.join(" ")
						.replaceAll('"', "")
						.replace(/\s+/g, " ")
						.split(" ")
						.map((s) => `"${s}"`)
						.join(" ");
					filter.bool.must_not.bool.should.push({
						wildcard: { text: { value: fixedQuery } },
					});
					filter.bool.must_not.bool.should.push({
						simple_query_string: {
							fields: ["text"],
							query: fixedQuery,
							default_operator: "and",
						},
					});
					filter.bool.must_not.bool.should.push({
						wildcard: { cw: { value: fixedQuery } },
					});
					filter.bool.must_not.bool.should.push({
						simple_query_string: {
							fields: ["cw"],
							query: fixedQuery,
							default_operator: "and",
						},
					});
					filter.bool.must_not.bool.should.push({
						wildcard: { renoteText: { value: fixedQuery } },
					});
					filter.bool.must_not.bool.should.push({
						simple_query_string: {
							fields: ["renoteText"],
							query: fixedQuery,
							default_operator: "and",
						},
					});
					filter.bool.must_not.bool.should.push({
						wildcard: { renoteCw: { value: fixedQuery } },
					});
					filter.bool.must_not.bool.should.push({
						simple_query_string: {
							fields: ["renoteCw"],
							query: fixedQuery,
							default_operator: "and",
						},
					});
				}

				esFilter.bool.must.push(filter);
			}
		}

		if (opts.hasFile) {
			esFilter.bool.must.push({
				// _name: "hasFile",
				bool: { must: [{ term: { hasFile: true } }] },
			});
		}

		if (opts.excludeRenoteNotQuote) {
			esFilter.bool.must.push({
				// _name: "hasFile",
				bool: {
					must: {
						bool: {
							should: [
								{
									bool: {
										must_not: [{ exists: { field: "renoteId" } }],
									},
								},
								{
									bool: {
										must: [
											{ exists: { field: "renoteId" } },
											{ term: { isQuote: true } },
										],
									},
								},
							] as any[],
							minimum_should_match: 1,
						},
					},
				},
			});
		}

		if (!opts.includeReplies) {
			esFilter.bool.must.push({
				// _name: "includeReplies",
				bool: { must_not: [{ exists: { field: "replyId" } }] },
			});
		}

		if (opts.tags && opts.tags.length > 0) {
			const filter = {
				// _name: "tags",
				bool: {
					must: {
						bool: {
							should: [] as any[],
							minimum_should_match: 1,
						},
					},
				},
			};

			// Clean up
			const tags = opts.tags
				.filter((xs) => xs !== "")
				.map((s) => s.replaceAll('"', "").replaceAll("#", ""));
			for (const tag of tags) {
				filter.bool.must.bool.should.push({
					match: {
						tags: tag,
					},
				});
			}

			esFilter.bool.must.push(filter);
		}

		if (opts.imageTypes && opts.imageTypes.length > 0) {
			const filter = {
				// _name: "imageTypes",
				bool: {
					must: {
						bool: {
							should: [] as any[],
							minimum_should_match: 1,
						},
					},
				},
			};

			// Clean up
			const types = opts.imageTypes
				.filter((xs) => xs !== "")
				.map((s) => s.replaceAll('"', "").replaceAll("#", ""));
			for (const type of types) {
				filter.bool.must.bool.should.push({
					match: {
						imageTypes: type,
					},
				});
			}

			esFilter.bool.must.push(filter);
		}

		if (opts.imageLabels && opts.imageLabels.length > 0) {
			const filter = {
				// _name: "imageLabels",
				bool: {
					must: {
						bool: {
							should: [] as any[],
							minimum_should_match: 1,
						},
					},
				},
			};

			// Clean up
			const labels = opts.imageLabels
				.filter((xs) => xs !== "")
				.map((s) => s.replaceAll('"', "").replaceAll("#", ""));
			for (const label of labels) {
				filter.bool.must.bool.should.push({
					match: {
						imageLabels: label,
					},
				});
			}

			esFilter.bool.must.push(filter);
		}

		return esFilter;
	}

	@bindThis
	public async searchNote(
		q: string,
		me: User | null,
		opts: {
			userIds?: Note["userId"][] | null;
			excludeUserIds?: Note["userId"][] | null;
			channelId?: Note["channelId"] | null;
			keywords?: string[][];
			excludeKeywords?: string[][];
			origin?: string;
			checkChannelSearchable?: boolean;
			createAtBegin?: number;
			createAtEnd?: number;
			reverseOrder?: boolean;
			excludeRenoteNotQuote?: boolean;
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
	): Promise<Note[]> {
		if (!this.opensearch) {
			return [];
		}

		const esFilter = this.getFilter(q, {
			userIds: opts.userIds,
			excludeUserIds: opts.excludeUserIds,
			channelId: opts.channelId,
			keywords: opts.keywords,
			excludeKeywords: opts.excludeKeywords,
			origin: opts.origin,
			checkChannelSearchable: opts.checkChannelSearchable,
			createAtBegin: opts.createAtBegin,
			createAtEnd: opts.createAtEnd,
			reverseOrder: opts.reverseOrder,
			excludeRenoteNotQuote: opts.excludeRenoteNotQuote,
			hasFile: opts.hasFile,
			includeReplies: opts.includeReplies,
			tags: opts.tags,
		});

		return this.searchNoteWithFilter(me, [esFilter], opts, pagination);
	}

	@bindThis
	public getPagenation(
		opts: {
			checkChannelSearchable?: boolean;
			reverseOrder?: boolean;
		},
		pagination: {
			equal?: Note["id"];
			untilId?: Note["id"];
			sinceId?: Note["id"];
			limit?: number;
		},
	) {
		const filter: any[] = [];
		if (pagination.equal) {
			filter.push({
				term: {
					createdAt: this.idService.parse(pagination.equal).date.getTime(),
				},
			});
		} else if (opts.reverseOrder) {
			if (pagination.untilId)
				filter.push({
					range: {
						createdAt: {
							gte: this.idService.parse(pagination.untilId).date.getTime(),
						},
					},
				});
			if (pagination.sinceId)
				filter.push({
					range: {
						createdAt: {
							lte: this.idService.parse(pagination.sinceId).date.getTime(),
						},
					},
				});
		} else {
			if (pagination.untilId)
				filter.push({
					range: {
						createdAt: {
							lte: this.idService.parse(pagination.untilId).date.getTime(),
						},
					},
				});
			if (pagination.sinceId)
				filter.push({
					range: {
						createdAt: {
							gte: this.idService.parse(pagination.sinceId).date.getTime(),
						},
					},
				});
		}
		return filter;
	}

	@bindThis
	public async searchNoteWithFilter(
		me: User | null,
		esFilters: any[],
		opts: {
			checkChannelSearchable?: boolean;
			reverseOrder?: boolean;
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

		const pagenationFilter = this.getPagenation(opts, pagination);

		let filter: any;
		if (esFilters.length === 1) {
			for (const pf of pagenationFilter) {
				esFilters[0].bool.must.push(pf);
			}
			filter = esFilters[0];
		} else {
			filter = { bool: { should: [], minimum_should_match: 1 } };
			for (const f of esFilters) {
				for (const pf of pagenationFilter) {
					f.bool.must.push(pf);
				}
				filter.bool.should.push(f);
			}
		}

		const res = await this.opensearch.search({
			index: this.opensearchNoteIndex as string,
			body: {
				query: filter,
				sort: [
					{
						createdAt: {
							order:
								opts.reverseOrder !== undefined && !opts.reverseOrder
									? "desc"
									: "asc",
						},
					},
				],
			},
			_source: ["id", "createdAt"],
			size: pagination.limit,
		});

		const noteIds = res.body.hits.hits.map((hit: any) => hit._id);
		if (noteIds.length === 0) {
			return [];
		}

		const query = this.notesRepository.createQueryBuilder("note");
		query.andWhereInIds(noteIds);

		if (opts.checkChannelSearchable) {
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
			opts.reverseOrder !== undefined && !opts.reverseOrder ? "DESC" : "ASC",
		);

		return await query.limit(pagination.limit).getMany();
	}
}
