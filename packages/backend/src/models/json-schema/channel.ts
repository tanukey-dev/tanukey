export const packedChannelSchema = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			optional: false, nullable: false,
			format: 'id',
			example: 'xxxxxxxxxx',
		},
		createdAt: {
			type: 'string',
			optional: false, nullable: false,
			format: 'date-time',
		},
		lastNotedAt: {
			type: 'string',
			optional: false, nullable: true,
			format: 'date-time',
		},
		name: {
			type: 'string',
			optional: false, nullable: false,
		},
		description: {
			type: 'string',
			nullable: true, optional: false,
		},
		bannerUrl: {
			type: 'string',
			format: 'url',
			nullable: true, optional: false,
		},
		isArchived: {
			type: 'boolean',
			optional: false, nullable: false,
		},
		federation: {
			type: 'boolean',
			optional: false, nullable: false,
		},
		searchable: {
			type: 'boolean',
			optional: false, nullable: false,
		},
		isNoteCollapsed: {
			type: 'boolean',
			optional: false, nullable: false,
		},
		isPrivate: {
			type: 'boolean',
			optional: false, nullable: false,
		},
		privateUserIds: {
			type: 'array',
			nullable: false, optional: false,
			items: {
				type: 'string',
				format: 'id',
			},
		},
		moderatorUserIds: {
			type: 'array',
			nullable: false, optional: false,
			items: {
				type: 'string',
				format: 'id',
			},
		},
		notesCount: {
			type: 'number',
			nullable: false, optional: false,
		},
		usersCount: {
			type: 'number',
			nullable: false, optional: false,
		},
		isFollowing: {
			type: 'boolean',
			optional: true, nullable: false,
		},
		isFavorited: {
			type: 'boolean',
			optional: true, nullable: false,
		},
		userId: {
			type: 'string',
			nullable: true, optional: false,
			format: 'id',
		},
		pinnedNoteIds: {
			type: 'array',
			nullable: false, optional: false,
			items: {
				type: 'string',
				format: 'id',
			},
		},
		color: {
			type: 'string',
			optional: false, nullable: false,
		},
		tags: {
			type: 'array',
			optional: true, nullable: false,
			items: {
				type: 'string',
				optional: false, nullable: false,
			},
		},
	},
} as const;
