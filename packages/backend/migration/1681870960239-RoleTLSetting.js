export class RoleTLSetting1681870960239 {
	name = "RoleTLSetting1681870960239";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "role" ADD "isExplorable" boolean NOT NULL DEFAULT false`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "isExplorable"`);
	}
}
