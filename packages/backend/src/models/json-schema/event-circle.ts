export const packedEventCircleSchema = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			optional: false, nullable: false,
			format: 'id',
			example: 'xxxxxxxxxx',
		},
		eventId: {
			type: 'string',
			optional: false, nullable: false,
			format: 'id',
		},
		circleId: {
			type: 'string',
			optional: false, nullable: false,
			format: 'id',
		},
		createdAt: {
			type: 'string',
			optional: false, nullable: false,
			format: 'date-time',
		},
		description: {
			type: 'string',
			nullable: true, optional: false,
		},
		pageId: {
			type: 'string',
			nullable: true, optional: false,
			format: 'id',
		},
	},
} as const;
