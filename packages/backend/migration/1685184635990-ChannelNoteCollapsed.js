export class ChannelNoteCollapsed1685184635990 {
    name = 'ChannelNoteCollapsed1685184635990'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel" ADD "isNoteCollapsed" boolean NOT NULL DEFAULT true`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "isNoteCollapsed"`);
    }
}
