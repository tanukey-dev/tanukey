export class EnableVoiceChatEachChannel1685349663769 {
    name = 'EnableVoiceChatEachChannel1685349663769'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel" ADD "isVoiceChatEnabled" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "isVoiceChatEnabled"`);
    }
}
