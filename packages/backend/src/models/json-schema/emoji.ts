export const packedEmojiSimpleSchema = {
	type: 'object',
	properties: {
		aliases: {
			type: 'array',
			optional: false, nullable: false,
			items: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
		},
		updatedAt: {
			type: 'string',
			format: 'date-time',
			optional: false, nullable: true,
		},
		name: {
			type: 'string',
			optional: false, nullable: false,
		},
		category: {
			type: 'string',
			optional: false, nullable: true,
		},
		url: {
			type: 'string',
			optional: false, nullable: false,
		},
		draft: {
			type: 'boolean',
			optional: false, nullable: true,
		},
		isSensitive: {
			type: 'boolean',
			optional: true, nullable: false,
		},
		roleIdsThatCanBeUsedThisEmojiAsReaction: {
			type: 'array',
			optional: true, nullable: false,
			items: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
		},
	},
} as const;

export const packedEmojiDetailedSchema = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			optional: false, nullable: false,
			format: 'id',
		},
		updatedAt: {
			type: 'string',
			format: 'date-time',
			optional: false, nullable: true,
		},
		aliases: {
			type: 'array',
			optional: false, nullable: false,
			items: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
		},
		name: {
			type: 'string',
			optional: false, nullable: false,
		},
		category: {
			type: 'string',
			optional: false, nullable: true,
		},
		host: {
			type: 'string',
			optional: false, nullable: true,
			description: 'The local host is represented with `null`.',
		},
		url: {
			type: 'string',
			optional: false, nullable: false,
		},
		license: {
			type: 'string',
			optional: false, nullable: true,
		},
		draft: {
			type: 'boolean',
			optional: false, nullable: true,
		},
		isSensitive: {
			type: 'boolean',
			optional: false, nullable: false,
		},
		localOnly: {
			type: 'boolean',
			optional: false, nullable: false,
		},
		roleIdsThatCanBeUsedThisEmojiAsReaction: {
			type: 'array',
			optional: false, nullable: false,
			items: {
				type: 'string',
				optional: false, nullable: false,
				format: 'id',
			},
		},
		uploadedUserName: {
			type: 'string',
			optional: false, nullable: true,
		},
	},
} as const;
