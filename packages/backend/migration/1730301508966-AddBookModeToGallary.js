export class AddBookModeToGallary1730301508966 {
	name = "AddBookModeToGallary1730301508966";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "gallery_post" ADD "viewSettings" json`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "gallery_post" DROP COLUMN "viewSettings"`,
		);
	}
}
