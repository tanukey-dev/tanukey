export const packedFollowingSchema = {
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
		followeeId: {
			type: 'string',
			optional: false, nullable: false,
			format: 'id',
		},
		followee: {
			type: 'object',
			optional: true, nullable: false,
			ref: 'UserDetailed',
		},
		followerId: {
			type: 'string',
			optional: false, nullable: false,
			format: 'id',
		},
		follower: {
			type: 'object',
			optional: true, nullable: false,
			ref: 'UserDetailed',
		},
	},
} as const;

export const packedFollowRequestSchema = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			optional: false, nullable: false,
			format: 'id',
			example: 'xxxxxxxxxx',
		},
		follower: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'UserLite',
		},
		followee: {
			type: 'object',
			optional: false, nullable: false,
			ref: 'UserLite',
		},
	},
} as const;
