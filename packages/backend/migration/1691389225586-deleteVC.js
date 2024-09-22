export class DeleteVC1691389225586 {
	name = "DeleteVC1691389225586";

	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableVoiceChat"`);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "liveKitServerURL"`,
		);
		await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "liveKitApiKey"`);
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "liveKitApiSecretKey"`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "liveKitApiSecretKey" character varying(1024)`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "liveKitApiKey" character varying(1024)`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "liveKitServerURL" character varying(1024)`,
		);
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "enableVoiceChat" boolean NOT NULL DEFAULT false`,
		);
	}
}
