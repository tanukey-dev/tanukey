export class AddDriveIdToEmoji1707429739152 {
	name = "AddDriveIdToEmoji1707429739152";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "emoji" ADD "driveFileId" character varying(32)`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_c8a310df925c42dd4f296437e7" ON "emoji" ("driveFileId") `,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_c8a310df925c42dd4f296437e7"`,
		);
		await queryRunner.query(`ALTER TABLE "emoji" DROP COLUMN "driveFileId"`);
	}
}
