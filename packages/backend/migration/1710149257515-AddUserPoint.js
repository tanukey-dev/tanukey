export class AddUserPoint1710149257515 {
	name = "AddUserPoint1710149257515";

	async up(queryRunner) {
		await queryRunner.query(
			`CREATE TABLE "user_point" ("id" character varying(32) NOT NULL, "userId" character varying(32) NOT NULL, "point" integer NOT NULL DEFAULT '0', "updatedAtDailyFirstNote" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_8cbdfb12d62030c7eac59d19dd5" PRIMARY KEY ("id")); COMMENT ON COLUMN "user_point"."userId" IS 'The ID of author.'`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_ef3e12732d419d56adeb772753" ON "user_point" ("userId") `,
		);
		await queryRunner.query(
			`ALTER TYPE "public"."user_profile_mutingnotificationtypes_enum" RENAME TO "user_profile_mutingnotificationtypes_enum_old"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."user_profile_mutingnotificationtypes_enum" AS ENUM('follow', 'mention', 'reply', 'renote', 'quote', 'reaction', 'pollEnded', 'receiveFollowRequest', 'followRequestAccepted', 'achievementEarned', 'app', 'point', 'pollVote', 'groupInvited')`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "mutingNotificationTypes" DROP DEFAULT`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "mutingNotificationTypes" TYPE "public"."user_profile_mutingnotificationtypes_enum"[] USING "mutingNotificationTypes"::"text"::"public"."user_profile_mutingnotificationtypes_enum"[]`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "mutingNotificationTypes" SET DEFAULT '{}'`,
		);
		await queryRunner.query(
			`DROP TYPE "public"."user_profile_mutingnotificationtypes_enum_old"`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_point" ADD CONSTRAINT "FK_ef3e12732d419d56adeb772753e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "user_point" DROP CONSTRAINT "FK_ef3e12732d419d56adeb772753e"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."user_profile_mutingnotificationtypes_enum_old" AS ENUM('follow', 'mention', 'reply', 'renote', 'quote', 'reaction', 'pollVote', 'pollEnded', 'receiveFollowRequest', 'followRequestAccepted', 'groupInvited', 'achievementEarned', 'app')`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "mutingNotificationTypes" DROP DEFAULT`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "mutingNotificationTypes" TYPE "public"."user_profile_mutingnotificationtypes_enum_old"[] USING "mutingNotificationTypes"::"text"::"public"."user_profile_mutingnotificationtypes_enum_old"[]`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_profile" ALTER COLUMN "mutingNotificationTypes" SET DEFAULT '{}'`,
		);
		await queryRunner.query(
			`DROP TYPE "public"."user_profile_mutingnotificationtypes_enum"`,
		);
		await queryRunner.query(
			`ALTER TYPE "public"."user_profile_mutingnotificationtypes_enum_old" RENAME TO "user_profile_mutingnotificationtypes_enum"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_ef3e12732d419d56adeb772753"`,
		);
		await queryRunner.query(`DROP TABLE "user_point"`);
	}
}
