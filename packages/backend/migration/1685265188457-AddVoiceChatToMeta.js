export class AddVoiceChatToMeta1685265188457 {
    name = 'AddVoiceChatToMeta1685265188457'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableVoiceChat" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "liveKitServerURL" character varying(1024)`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "liveKitApiKey" character varying(1024)`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "liveKitApiSecretKey" character varying(1024)`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "liveKitApiSecretKey"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "liveKitApiKey"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "liveKitServerURL"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableVoiceChat"`);
    }
}
