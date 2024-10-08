export class AddAntennaInfoToNote1728346390344 {
	name = "AddAntennaInfoToNote1728346390344";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "note" ADD "antennaIds" character varying(32) array NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "note" ADD "antennaChannelIds" character varying(32) array NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_9e10068a323fa94361ef34eca3" ON "note" ("antennaIds") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_25988cb9fc7b450eff6f266639" ON "note" ("antennaChannelIds") `,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_25988cb9fc7b450eff6f266639"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_9e10068a323fa94361ef34eca3"`,
		);
		await queryRunner.query(
			`ALTER TABLE "note" DROP COLUMN "antennaChannelIds"`,
		);
		await queryRunner.query(`ALTER TABLE "note" DROP COLUMN "antennaIds"`);
	}
}
