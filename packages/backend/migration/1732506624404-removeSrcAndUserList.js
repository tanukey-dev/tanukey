export class RemoveSrcAndUserList1732506624404 {
	name = "RemoveSrcAndUserList1732506624404";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "antenna" DROP CONSTRAINT "FK_709d7d32053d0dd7620f678eeb9"`,
		);
		await queryRunner.query(`ALTER TABLE "antenna" DROP COLUMN "src"`);
		await queryRunner.query(`DROP TYPE "public"."antenna_src_enum"`);
		await queryRunner.query(`ALTER TABLE "antenna" DROP COLUMN "userListId"`);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD "userListId" character varying(32)`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."antenna_src_enum" AS ENUM('home', 'all', 'users', 'list')`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD "src" "public"."antenna_src_enum" NOT NULL`,
		);
		await queryRunner.query(
			`ALTER TABLE "antenna" ADD CONSTRAINT "FK_709d7d32053d0dd7620f678eeb9" FOREIGN KEY ("userListId") REFERENCES "user_list"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}
}
