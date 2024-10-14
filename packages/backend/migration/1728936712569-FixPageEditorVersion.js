export class FixPageEditorVersion1728936712569 {
	name = "FixPageEditorVersion1728936712569";

	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "editorVersion"`);
		await queryRunner.query(`DROP TYPE "public"."page_editorversion_enum"`);
		await queryRunner.query(
			`ALTER TABLE "page" ADD "editorVersion" integer NOT NULL DEFAULT '1'`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "editorVersion"`);
		await queryRunner.query(
			`CREATE TYPE "public"."page_editorversion_enum" AS ENUM('1', '2')`,
		);
		await queryRunner.query(
			`ALTER TABLE "page" ADD "editorVersion" "public"."page_editorversion_enum" NOT NULL DEFAULT '1'`,
		);
	}
}
