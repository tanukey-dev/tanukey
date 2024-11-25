export class AddImageTypesAndImageLabels1732515633913 {
	name = "AddImageTypesAndImageLabels1732515633913";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD "imageTypes" character varying(1024) array NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD "imageLabels" character varying(1024) array NOT NULL DEFAULT '{}'`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "antenna" DROP COLUMN "imageLabels"`);
		await queryRunner.query(`ALTER TABLE "antenna" DROP COLUMN "imageTypes"`);
	}
}
