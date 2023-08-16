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
		circleImageId: {
			type: 'string',
			format: 'id',
			nullable: true, optional: false,
		},
		circleImageUrl: {
			type: 'string',
			format: 'url',
			nullable: true, optional: false,
		},
	},
} as const;
