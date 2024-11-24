export class RemoveEventAndCircle1732433809606 {
	name = "RemoveEventAndCircle1732433809606";

	async up(queryRunner) {
		await queryRunner.query(`DROP TABLE "event_circle"`);
		await queryRunner.query(`DROP TABLE "event"`);
		await queryRunner.query(`DROP TABLE "circle"`);
	}

	async down(queryRunner) {}
}
