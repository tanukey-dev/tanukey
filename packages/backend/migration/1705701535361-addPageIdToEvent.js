export class AddPageIdToEvent1705701535361 {
    name = 'AddPageIdToEvent1705701535361'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "event_circle" DROP CONSTRAINT "FK_030e788271a81b186000bf2f0cd"`);
        await queryRunner.query(`ALTER TABLE "event_circle" RENAME COLUMN "circleImageId" TO "pageId"`);
        await queryRunner.query(`ALTER TABLE "circle" ADD "pageId" character varying(32)`);
        await queryRunner.query(`ALTER TABLE "event" ADD "pageId" character varying(32)`);
        await queryRunner.query(`CREATE INDEX "IDX_1642f51b7417f5ddffd32c7134" ON "event" ("startsAt") `);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_1642f51b7417f5ddffd32c7134"`);
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "pageId"`);
        await queryRunner.query(`ALTER TABLE "circle" DROP COLUMN "pageId"`);
        await queryRunner.query(`ALTER TABLE "event_circle" RENAME COLUMN "pageId" TO "circleImageId"`);
        await queryRunner.query(`ALTER TABLE "event_circle" ADD CONSTRAINT "FK_030e788271a81b186000bf2f0cd" FOREIGN KEY ("circleImageId") REFERENCES "drive_file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
}
