export const notificationTypes = ['follow', 'mention', 'reply', 'renote', 'quote', 'reaction', 'pollEnded', 'receiveFollowRequest', 'followRequestAccepted', 'achievementEarned', 'app'] as const;
export const obsoleteNotificationTypes = ['pollVote', 'groupInvited'] as const;

export const noteVisibilities = ['public', 'home', 'followers', 'specified'] as const;

export const mutedNoteReasons = ['word', 'manual', 'spam', 'other'] as const;

export const ffVisibility = ['public', 'followers', 'private'] as const;

export const subscriptionStatus = [
	'incomplete',
	'incomplete_expired',
	'trialing',
	'active',
	'past_due',
	'paused',
	'canceled',
	'unpaid',
	'none',
] as const;
