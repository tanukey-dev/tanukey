import { setTimeout } from 'node:timers/promises';
import { Global, Inject, Module } from '@nestjs/common';
import * as Redis from 'ioredis';
import { DataSource } from 'typeorm';
import { Client as ElasticSearch } from '@elastic/elasticsearch';
import { DI } from './di-symbols.js';
import { Config, loadConfig } from './config.js';
import { createPostgresDataSource } from './postgres.js';
import { RepositoryModule } from './models/RepositoryModule.js';
import type { Provider, OnApplicationShutdown } from '@nestjs/common';

const $config: Provider = {
	provide: DI.config,
	useValue: loadConfig(),
};

const $db: Provider = {
	provide: DI.db,
	useFactory: async (config) => {
		const db = createPostgresDataSource(config);
		return await db.initialize();
	},
	inject: [DI.config],
};

const $elasticsearch: Provider = {
	provide: DI.elasticsearch,
	useFactory: (config: Config) => {
		if (config.elasticsearch) {
			return new ElasticSearch({
				nodes: `${config.elasticsearch.ssl ? 'https' : 'http'}://${config.elasticsearch.host}:${config.elasticsearch.port}`,
				auth: {
					username: config.elasticsearch.user,
					password: config.elasticsearch.pass,
				},
				//headers: {'Content-Type': 'application/json'},
			});
		} else {
			return null;
		}
	},
	inject: [DI.config],
};

const $redis: Provider = {
	provide: DI.redis,
	useFactory: (config: Config) => {
		return new Redis.Redis({
			port: config.redis.port,
			host: config.redis.host,
			family: config.redis.family == null ? 0 : config.redis.family,
			password: config.redis.pass,
			keyPrefix: `${config.redis.prefix}:`,
			db: config.redis.db ?? 0,
		});
	},
	inject: [DI.config],
};

const $redisForPub: Provider = {
	provide: DI.redisForPub,
	useFactory: (config: Config) => {
		const redis = new Redis.Redis({
			port: config.redisForPubsub.port,
			host: config.redisForPubsub.host,
			family: config.redisForPubsub.family == null ? 0 : config.redisForPubsub.family,
			password: config.redisForPubsub.pass,
			keyPrefix: `${config.redisForPubsub.prefix}:`,
			db: config.redisForPubsub.db ?? 0,
		});
		return redis;
	},
	inject: [DI.config],
};

const $redisForSub: Provider = {
	provide: DI.redisForSub,
	useFactory: (config: Config) => {
		const redis = new Redis.Redis({
			port: config.redisForPubsub.port,
			host: config.redisForPubsub.host,
			family: config.redisForPubsub.family == null ? 0 : config.redisForPubsub.family,
			password: config.redisForPubsub.pass,
			keyPrefix: `${config.redisForPubsub.prefix}:`,
			db: config.redisForPubsub.db ?? 0,
		});
		redis.subscribe(config.host);
		return redis;
	},
	inject: [DI.config],
};

@Global()
@Module({
	imports: [RepositoryModule],
	providers: [$config, $db, $elasticsearch, $redis, $redisForPub, $redisForSub],
	exports: [$config, $db, $elasticsearch, $redis, $redisForPub, $redisForSub, RepositoryModule],
})
export class GlobalModule implements OnApplicationShutdown {
	constructor(
		@Inject(DI.db) private db: DataSource,
		@Inject(DI.redis) private redisClient: Redis.Redis,
		@Inject(DI.redisForPub) private redisForPub: Redis.Redis,
		@Inject(DI.redisForSub) private redisForSub: Redis.Redis,
	) {}

	public async dispose(): Promise<void> {
		if (process.env.NODE_ENV === 'test') {
			// XXX:
			// Shutting down the existing connections causes errors on Jest as
			// Misskey has asynchronous postgres/redis connections that are not
			// awaited.
			// Let's wait for some random time for them to finish.
			await setTimeout(5000);
		}
		await Promise.all([
			this.db.destroy(),
			this.redisClient.disconnect(),
			this.redisForPub.disconnect(),
			this.redisForSub.disconnect(),
		]);
	}

	async onApplicationShutdown(signal: string): Promise<void> {
		await this.dispose();
	}
}
