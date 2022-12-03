import { Inject, Injectable } from '@nestjs/common';
import promiseLimit from 'promise-limit';
import { DI } from '@/di-symbols.js';
import type { UsersRepository } from '@/models/index.js';
import type { Config } from '@/config.js';
import { toArray, unique } from '@/misc/prelude/array.js';
import type { CacheableUser } from '@/models/entities/User.js';
import { isMention } from '../type.js';
import { ApResolverService, Resolver } from '../ApResolverService.js';
import { ApPersonService } from './ApPersonService.js';
import type { IObject, IApMention } from '../type.js';

@Injectable()
export class ApMentionService {
	constructor(
		@Inject(DI.config)
		private config: Config,

		private apResolverService: ApResolverService,
		private apPersonService: ApPersonService,
	) {
	}

	public async extractApMentions(tags: IObject | IObject[] | null | undefined, resolver?: Resolver) {
		const hrefs = unique(this.extractApMentionObjects(tags).map(x => x.href as string));
	
		if (resolver == null) resolver = this.apResolverService.createResolver();
	
		const limit = promiseLimit<CacheableUser | null>(2);
		const mentionedUsers = (await Promise.all(
			hrefs.map(x => limit(() => this.apPersonService.resolvePerson(x, resolver).catch(() => null))),
		)).filter((x): x is CacheableUser => x != null);
	
		return mentionedUsers;
	}
	
	public extractApMentionObjects(tags: IObject | IObject[] | null | undefined): IApMention[] {
		if (tags == null) return [];
		return toArray(tags).filter(isMention);
	}
}
