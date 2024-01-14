const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class SubscriptionDetails1705211285921 {
    name = 'SubscriptionDetails1705211285921'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "subscription_plan" ADD "price" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscription_plan" ADD "currency" character varying(128) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscription_plan" ADD "description" character varying(256) NOT NULL`);
    }

    async down(queryRunner) {
				await queryRunner.query(`ALTER TABLE "subscription_plan" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "subscription_plan" DROP COLUMN "currency"`);
        await queryRunner.query(`ALTER TABLE "subscription_plan" DROP COLUMN "price"`);
		}
}
