export class AddEmojiStatus1728153261298 {
	name = "AddEmojiStatus1728153261298";

	async up(queryRunner) {
		await queryRunner.query(
			`UPDATE emoji SET status='APPROVED' WHERE draft = FALSE;`,
		);
	}

	async down(queryRunner) {}
}
