export const packedEventSchema = {
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
		bannerId: {
			type: 'string',
			nullable: true, optional: false,
			format: 'id',
		},
		bannerUrl: {
			type: 'string',
			format: 'url',
			nullable: true, optional: false,
		},
	},
} as const;
