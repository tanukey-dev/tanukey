export class ChannelSearchable1684794335691 {
    name = 'ChannelSearchable1684794335691'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "channel" ADD "searchable" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`CREATE INDEX "IDX_1ce26bc021a3de486cd8c69faf" ON "channel" ("searchable") `);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_1ce26bc021a3de486cd8c69faf"`);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "searchable"`);
    }
}
