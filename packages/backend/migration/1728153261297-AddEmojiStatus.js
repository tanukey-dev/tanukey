export class AddEmojiStatus1728153261297 {
	name = "AddEmojiStatus1728153261297";

	async up(queryRunner) {
		await queryRunner.query(
			`CREATE TYPE "public"."emoji_status_enum" AS ENUM('DRAFT', 'APPROVED', 'REJECTED')`,
		);
		await queryRunner.query(
			`ALTER TABLE "emoji" ADD "status" "public"."emoji_status_enum" NOT NULL DEFAULT 'DRAFT'`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "emoji" DROP COLUMN "status"`);
		await queryRunner.query(`DROP TYPE "public"."emoji_status_enum"`);
	}
}
