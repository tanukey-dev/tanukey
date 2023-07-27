export class ad1677054292210 {
	name = 'ad1677054292210';
	async up(queryRunner) {
			await queryRunner.query(`ALTER TABLE "ad" ADD "dayOfWeek" integer NOT NULL Default 0`);
	}
	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "ad" DROP COLUMN "dayOfWeek"`);
	}
}
