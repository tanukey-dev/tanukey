export class SubscriptionPlan1704130867407 {
    name = 'SubscriptionPlan1704130867407'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."user_subscriptionstatus_enum" AS ENUM('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'paused', 'canceled', 'unpaid', 'none')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "subscriptionStatus" "public"."user_subscriptionstatus_enum" NOT NULL DEFAULT 'none'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "subscriptionPlanId" character varying(32)`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableSubscriptions" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "stripeCustomerId" character varying(128)`);
        await queryRunner.query(`COMMENT ON COLUMN "user_profile"."stripeCustomerId" IS 'The stripe customer id of the User.'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`COMMENT ON COLUMN "user_profile"."stripeCustomerId" IS 'The stripe customer id of the User.'`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "stripeCustomerId"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableSubscriptions"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "subscriptionPlanId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "subscriptionStatus"`);
        await queryRunner.query(`DROP TYPE "public"."user_subscriptionstatus_enum"`);
    }
}
