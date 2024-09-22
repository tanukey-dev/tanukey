export class PublicReactionsDefaultTrue1683683083083 {
	name = "PublicReactionsDefaultTrue1683683083083";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "publicReactions" SET DEFAULT true`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "publicReactions" SET DEFAULT false`,
		);
	}
}
