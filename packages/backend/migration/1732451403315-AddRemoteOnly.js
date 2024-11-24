export class AddRemoteOnly1732451403315 {
	name = "AddRemoteOnly1732451403315";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD "remoteOnly" boolean NOT NULL DEFAULT false`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "antenna" DROP COLUMN "remoteOnly"`);
	}
}
