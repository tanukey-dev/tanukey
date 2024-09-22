export class AddEnableAllowedNotificationInLocalUserFollowed1708494758636 {
	name = "AddEnableAllowedNotificationInLocalUserFollowed1708494758636";

	async up(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "meta" ADD "enableAllowedNotificationInLocalUserFollowed" boolean NOT NULL DEFAULT false`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "meta" DROP COLUMN "enableAllowedNotificationInLocalUserFollowed"`,
		);
	}
}
