export class AddPinnedLtlChannelIdsToMeta1684460724670 {
    name = 'AddPinnedLtlChannelIdsToMeta1684460724670'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "pinnedLtlChannelIds" character varying(32) array NOT NULL DEFAULT '{}'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "pinnedLtlChannelIds"`);
    }
}
