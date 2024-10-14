export class AddPageEditorVersion1728936079447 {
	name = "AddPageEditorVersion1728936079447";

	async up(queryRunner) {
		await queryRunner.query(
			`CREATE TYPE "public"."page_editorversion_enum" AS ENUM('1', '2')`,
		);
		await queryRunner.query(
			`ALTER TABLE "page" ADD "editorVersion" "public"."page_editorversion_enum" NOT NULL DEFAULT '1'`,
		);
		await queryRunner.query(`ALTER TABLE "page" ADD "text" text`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "text"`);
		await queryRunner.query(`ALTER TABLE "page" DROP COLUMN "editorVersion"`);
		await queryRunner.query(`DROP TYPE "public"."page_editorversion_enum"`);
	}
}
