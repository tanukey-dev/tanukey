export class FixMatchedAntenna1728401814468 {
	name = "FixMatchedAntenna1728401814468";

	async up(queryRunner) {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_9e10068a323fa94361ef34eca3"`,
		);
		await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "antennaIds"`);

		await queryRunner.query(
			`ALTER TABLE "note" ADD "matchedAntennaIds" character varying(32) array NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_018c04085c54f9c77148ddf4ce" ON "note" ("matchedAntennaIds") `,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_018c04085c54f9c77148ddf4ce"`,
		);
		await queryRunner.query(
			`ALTER TABLE "note" DROP COLUMN "matchedAntennaIds"`,
		);

		await queryRunner.query(
			`ALTER TABLE "note" ADD "antennaIds" character varying(32) array NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_9e10068a323fa94361ef34eca3" ON "note" ("antennaIds") `,
		);
	}
}
