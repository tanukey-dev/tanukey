export class DeleteDraft1728154778305 {
	name = "DeleteDraft1728154778305";

	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "emoji" DROP COLUMN "draft"`);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "emoji" ADD "draft" boolean NOT NULL DEFAULT false`,
		);
	}
}
