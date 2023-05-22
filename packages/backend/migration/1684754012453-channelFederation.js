export class ChannelFederation1684754012453 {
    name = 'ChannelFederation1684754012453'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel" ADD "federation" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "federation"`);
    }
}
