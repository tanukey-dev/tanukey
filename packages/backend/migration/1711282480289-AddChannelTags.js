export class AddChannelTags1711282480289 {
	name = "AddChannelTags1711282480289";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "channel" ADD "tags" character varying(128) array NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_0e3c009bce2cd6b354907f0b4a" ON "channel" ("tags") `,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`DROP INDEX "public"."IDX_0e3c009bce2cd6b354907f0b4a"`,
		);
		await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "tags"`);
	}
}
