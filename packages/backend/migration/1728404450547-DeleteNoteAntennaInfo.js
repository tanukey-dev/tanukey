export class DeleteNoteAntennaInfo1728404450547 {
	name = "DeleteNoteAntennaInfo1728404450547";

	async up(queryRunner) {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_25988cb9fc7b450eff6f266639"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_018c04085c54f9c77148ddf4ce"`,
		);
		await queryRunner.query(
			`ALTER TABLE "note" DROP COLUMN "antennaChannelIds"`,
		);
		await queryRunner.query(
			`ALTER TABLE "note" DROP COLUMN "matchedAntennaIds"`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "note" ADD "matchedAntennaIds" character varying(32) array NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`ALTER TABLE "note" ADD "antennaChannelIds" character varying(32) array NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_018c04085c54f9c77148ddf4ce" ON "note" ("matchedAntennaIds") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_25988cb9fc7b450eff6f266639" ON "note" ("antennaChannelIds") `,
		);
	}
}
