export class AddSubscriptionStatus1709552807345 {
	name = "AddSubscriptionStatus1709552807345";

	async up(queryRunner) {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_01hk5pxbb3f8fd71v1h3mm84gx"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."subscription_status_status_enum" AS ENUM('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'paused', 'canceled', 'unpaid', 'none')`,
		);
		await queryRunner.query(
			`CREATE TABLE "subscription_status" ("id" character varying(32) NOT NULL, "userId" character varying(32), "planId" character varying(32), "status" "public"."subscription_status_status_enum" NOT NULL DEFAULT 'none', CONSTRAINT "PK_4945b2b04f93b79dabdfb8b5758" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_1323956d6b64e1c10fd918bbda" ON "subscription_status" ("userId") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_e1d1224da21aed7e3b4a3ab5e0" ON "subscription_status" ("planId") `,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_4a984d3bf6169912a919357122" ON "subscription_status" ("userId", "planId") `,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_4a984d3bf6169912a919357122"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_e1d1224da21aed7e3b4a3ab5e0"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_1323956d6b64e1c10fd918bbda"`,
		);
		await queryRunner.query(`DROP TABLE "subscription_status"`);
		await queryRunner.query(
			`DROP TYPE "public"."subscription_status_status_enum"`,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_01hk5pxbb3f8fd71v1h3mm84gx" ON "subscription_plan" ("roleId") `,
		);
	}
}
