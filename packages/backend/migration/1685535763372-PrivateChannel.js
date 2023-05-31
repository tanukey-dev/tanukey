export class PrivateChannel1685535763372 {
    name = 'PrivateChannel1685535763372'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel" ADD "isPrivate" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "channel" ADD "privateUserIds" character varying(128) array NOT NULL DEFAULT '{}'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "privateUserIds"`);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "isPrivate"`);
    }
}
