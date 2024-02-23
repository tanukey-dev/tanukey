export class AddStripSubscriptionId1708692447371 {
    name = 'AddStripSubscriptionId1708692447371'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "stripeSubscriptionId" character varying(128)`);
        await queryRunner.query(`ALTER TABLE "subscription_plan" ALTER COLUMN "price" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "subscription_plan" ALTER COLUMN "currency" DROP DEFAULT`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_35f74e00f76943927adf197028" ON "subscription_plan" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "subscription_plan" ADD CONSTRAINT "FK_35f74e00f76943927adf197028f" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "subscription_plan" DROP CONSTRAINT "FK_35f74e00f76943927adf197028f"`);
        await queryRunner.query(`ALTER TABLE "subscription_plan" ALTER COLUMN "currency" SET DEFAULT 'JPY'`);
        await queryRunner.query(`ALTER TABLE "subscription_plan" ALTER COLUMN "price" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "stripeSubscriptionId"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_01hk5pxbb3f8fd71v1h3mm84gx" ON "subscription_plan" ("roleId") `);
    }
}
