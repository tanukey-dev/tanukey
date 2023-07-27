import { Injectable } from '@nestjs/common';
import promiseLimit from 'promise-limit';
import type { RemoteUser, User } from '@/models/entities/User.js';
import { concat, unique } from '@/misc/prelude/array.js';
import { bindThis } from '@/decorators.js';
import { getApIds } from './type.js';
import { ApPersonService } from './models/ApPersonService.js';
import type { ApObject } from './type.js';
import type { Resolver } from './ApResolverService.js';

type Visibility = 'public' | 'home' | 'followers' | 'specified';

type AudienceInfo = {
	visibility: Visibility,
	mentionedUsers: User[],
	visibleUsers: User[],
};

@Injectable()
export class ApAudienceService {
	constructor(
		private apPersonService: ApPersonService,
	) {
	}

	@bindThis
	public async parseAudience(actor: RemoteUser, to?: ApObject, cc?: ApObject, resolver?: Resolver): Promise<AudienceInfo> {
		const toGroups = this.groupingAudience(getApIds(to), actor);
		const ccGroups = this.groupingAudience(getApIds(cc), actor);
	
		const others = unique(concat([toGroups.other, ccGroups.other]));
	
		const limit = promiseLimit<User | null>(2);
		const mentionedUsers = (await Promise.all(
			others.map(id => limit(() => this.apPersonService.resolvePerson(id, resolver).catch(() => null))),
		)).filter((x): x is User => x != null);
	
		if (toGroups.public.length > 0) {
			return {
				visibility: 'public',
				mentionedUsers,
				visibleUsers: [],
			};
		}
	
		if (ccGroups.public.length > 0) {
			return {
				visibility: 'home',
				mentionedUsers,
				visibleUsers: [],
			};
		}
	
		if (toGroups.followers.length > 0) {
			return {
				visibility: 'followers',
				mentionedUsers,
				visibleUsers: [],
			};
		}
	
		return {
			visibility: 'specified',
			mentionedUsers,
			visibleUsers: mentionedUsers,
		};
	}
	
	@bindThis
	private groupingAudience(ids: string[], actor: RemoteUser) {
		const groups = {
			public: [] as string[],
			followers: [] as string[],
			other: [] as string[],
		};
	
		for (const id of ids) {
			if (this.isPublic(id)) {
				groups.public.push(id);
			} else if (this.isFollowers(id, actor)) {
				groups.followers.push(id);
			} else {
				groups.other.push(id);
			}
		}
	
		groups.other = unique(groups.other);
	
		return groups;
	}
	
	@bindThis
	private isPublic(id: string) {
		return [
			'https://www.w3.org/ns/activitystreams#Public',
			'as:Public',
			'Public',
		].includes(id);
	}
	
	@bindThis
	private isFollowers(id: string, actor: RemoteUser) {
		return (
			id === (actor.followersUri ?? `${actor.uri}/followers`)
		);
	}
}
