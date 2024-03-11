export const packedUserPointSchema = {
	type: 'object',
	properties: {
		point: {
			type: 'number',
			optional: false, nullable: false,
		},
		updatedAtDailyFirstNote: {
			type: 'string',
			optional: false, nullable: true,
			format: 'date-time',
		},
	},
} as const;
