export class AddDateToEvent1705697516629 {
	name = "AddDateToEvent1705697516629";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "event" ADD "expiresAt" TIMESTAMP WITH TIME ZONE`,
		);
		await queryRunner.query(
			`ALTER TABLE "event" ADD "startsAt" TIMESTAMP WITH TIME ZONE`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "startsAt"`);
		await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "expiresAt"`);
	}
}
