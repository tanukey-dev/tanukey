export class AddDriveMetadata1732507426662 {
	name = "AddDriveMetadata1732507426662";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "drive_file" ADD "metadata" jsonb NOT NULL DEFAULT '{}'`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "drive_file" DROP COLUMN "metadata"`);
	}
}
