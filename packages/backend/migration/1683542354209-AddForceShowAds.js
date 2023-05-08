export class AddForceShowAds1683542354209 {
    name = 'AddForceShowAds1683542354209'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "ad" ADD "forceShowAds" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "ad" DROP COLUMN "forceShowAds"`);
    }
}
