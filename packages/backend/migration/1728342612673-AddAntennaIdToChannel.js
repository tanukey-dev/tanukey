export class AddAntennaIdToChannel1728342612673 {
	name = "AddAntennaIdToChannel1728342612673";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "channel" ADD "antennaId" character varying(32)`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_effeeab1084bea9f87f31f6704" ON "channel" ("antennaId") `,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_effeeab1084bea9f87f31f6704"`,
		);
		await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "antennaId"`);
	}
}
