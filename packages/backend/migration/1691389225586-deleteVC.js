export class DeleteVC1691389225586 {
    name = 'DeleteVC1691389225586'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableVoiceChat"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "liveKitServerURL"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "liveKitApiKey"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "liveKitApiSecretKey"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableServerMachineStats"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableIdenticonGeneration"`);
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{ "admin", "administrator", "root", "system", "maintainer", "host", "mod", "moderator", "owner", "superuser", "staff", "auth", "i", "me", "everyone", "all", "mention", "mentions", "example", "user", "users", "account", "accounts", "official", "help", "helps", "support", "supports", "info", "information", "informations", "announce", "announces", "announcement", "announcements", "notice", "notification", "notifications", "dev", "developer", "developers", "tech", "misskey" }'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ALTER COLUMN "preservedUsernames" SET DEFAULT '{admin,administrator,root,system,maintainer,host,mod,moderator,owner,superuser,staff,auth,i,me,everyone,all,mention,mentions,example,user,users,account,accounts,official,help,helps,support,supports,info,information,informations,announce,announces,announcement,announcements,notice,notification,notifications,dev,developer,developers,tech,misskey}'`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableIdenticonGeneration" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableServerMachineStats" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "liveKitApiSecretKey" character varying(1024)`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "liveKitApiKey" character varying(1024)`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "liveKitServerURL" character varying(1024)`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableVoiceChat" boolean NOT NULL DEFAULT false`);
    }
}
