export class AddChannelModerator1686756164317 {
    name = 'AddChannelModerator1686756164317'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel" ADD "moderatorUserIds" character varying(128) array NOT NULL DEFAULT '{}'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "moderatorUserIds"`);
    }
}
