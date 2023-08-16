export class DeleteisVoiceChatEnable1692186788620 {
    name = 'DeleteisVoiceChatEnable1692186788620'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "isVoiceChatEnabled"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel" ADD "isVoiceChatEnabled" boolean NOT NULL DEFAULT false`);
    }
}
