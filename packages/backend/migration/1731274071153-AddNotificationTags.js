export class AddNotificationTags1731274071153 {
	name = "AddNotificationTags1731274071153";

	async up(queryRunner) {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_effeeab1084bea9f87f31f6704"`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel" RENAME COLUMN "antennaId" TO "notificationTags"`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel" DROP COLUMN "notificationTags"`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel" ADD "notificationTags" character varying(128) array NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_40772f6eb2b54acc1648987a26" ON "channel" ("notificationTags") `,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_40772f6eb2b54acc1648987a26"`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel" DROP COLUMN "notificationTags"`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel" ADD "notificationTags" character varying(32)`,
		);
		await queryRunner.query(
			`ALTER TABLE "channel" RENAME COLUMN "notificationTags" TO "antennaId"`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_effeeab1084bea9f87f31f6704" ON "channel" ("antennaId") `,
		);
	}
}
