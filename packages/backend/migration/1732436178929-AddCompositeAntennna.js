export class AddCompositeAntennna1732436178929 {
	name = "AddCompositeAntennna1732436178929";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD "public" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD "excludeUsers" character varying(1024) array NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD "compositeAntennaIds" jsonb NOT NULL DEFAULT '[]'`,
		);
		await queryRunner.query(`ALTER TABLE "antenna" ADD "filterTree" text`);
		await queryRunner.query(
			`CREATE INDEX "IDX_bda863fde80450fb529c6fad24" ON "antenna" ("public") `,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_bda863fde80450fb529c6fad24"`,
		);
		await queryRunner.query(`ALTER TABLE "antenna" DROP COLUMN "filterTree"`);
		await queryRunner.query(
			`ALTER TABLE "antenna" DROP COLUMN "compositeAntennaIds"`,
		);
		await queryRunner.query(`ALTER TABLE "antenna" DROP COLUMN "excludeUsers"`);
		await queryRunner.query(`ALTER TABLE "antenna" DROP COLUMN "public"`);
	}
}
