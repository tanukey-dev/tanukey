export class AddArchive1706618375791 {
    name = 'AddArchive1706618375791'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "circle" ADD "isArchived" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "event" ADD "isArchived" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "event_circle" ADD "isArchived" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{ "admin", "administrator", "root", "system", "maintainer", "host", "mod", "moderator", "owner", "superuser", "staff", "auth", "i", "me", "everyone", "all", "mention", "mentions", "example", "user", "users", "account", "accounts", "official", "help", "helps", "support", "supports", "info", "information", "informations", "announce", "announces", "announcement", "announcements", "notice", "notification", "notifications", "dev", "developer", "developers", "tech", "misskey" }'`);
        await queryRunner.query(`CREATE INDEX "IDX_cf6ae4698e499a99a9ee6d12b6" ON "circle" ("isArchived") `);
        await queryRunner.query(`CREATE INDEX "IDX_0e53fe0f67f3806b22d0af7aba" ON "event" ("isArchived") `);
        await queryRunner.query(`CREATE INDEX "IDX_027fc09d127e9e8c3097cd6239" ON "event_circle" ("isArchived") `);
        await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6" FOREIGN KEY ("muteeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "renote_muting" ADD CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d" FOREIGN KEY ("muterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7aa72a5fe76019bfe8e5e0e8b7d"`);
        await queryRunner.query(`ALTER TABLE "renote_muting" DROP CONSTRAINT "FK_7eac97594bcac5ffcf2068089b6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_027fc09d127e9e8c3097cd6239"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0e53fe0f67f3806b22d0af7aba"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cf6ae4698e499a99a9ee6d12b6"`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{admin,administrator,root,system,maintainer,host,mod,moderator,owner,superuser,staff,auth,i,me,everyone,all,mention,mentions,example,user,users,account,accounts,official,help,helps,support,supports,info,information,informations,announce,announces,announcement,announcements,notice,notification,notifications,dev,developer,developers,tech,misskey}'`);
        await queryRunner.query(`ALTER TABLE "event_circle" DROP COLUMN "isArchived"`);
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "isArchived"`);
        await queryRunner.query(`ALTER TABLE "circle" DROP COLUMN "isArchived"`);
    }
}
