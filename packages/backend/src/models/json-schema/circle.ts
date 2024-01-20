export const packedCircleSchema = {
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
		userId: {
			type: 'string',
			nullable: true, optional: false,
			format: 'id',
		},
		name: {
			type: 'string',
			optional: false, nullable: false,
		},
		description: {
			type: 'string',
			nullable: true, optional: false,
		},
		profileImageId: {
			type: 'string',
			nullable: true, optional: false,
			format: 'id',
		},
		profileImageUrl: {
			type: 'string',
			format: 'url',
			nullable: true, optional: false,
		},
		pageId: {
			type: 'string',
			nullable: true, optional: false,
			format: 'id',
		},
	},
} as const;
