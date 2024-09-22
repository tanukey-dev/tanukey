export class AddArchive1706618375791 {
	name = "AddArchive1706618375791";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "circle" ADD "isArchived" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "event" ADD "isArchived" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`ALTER TABLE "event_circle" ADD "isArchived" boolean NOT NULL DEFAULT false`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_cf6ae4698e499a99a9ee6d12b6" ON "circle" ("isArchived") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_0e53fe0f67f3806b22d0af7aba" ON "event" ("isArchived") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_027fc09d127e9e8c3097cd6239" ON "event_circle" ("isArchived") `,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_027fc09d127e9e8c3097cd6239"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_0e53fe0f67f3806b22d0af7aba"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_cf6ae4698e499a99a9ee6d12b6"`,
		);
		await queryRunner.query(
			`ALTER TABLE "event_circle" DROP COLUMN "isArchived"`,
		);
		await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "isArchived"`);
		await queryRunner.query(`ALTER TABLE "circle" DROP COLUMN "isArchived"`);
	}
}
