export class AddAdditionalPointToRoleSetting1710250433989 {
    name = 'AddAdditionalPointToRoleSetting1710250433989'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "role" ADD "loginBonusAdditionalPoint" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_point" ALTER COLUMN "updatedAtDailyFirstNote" DROP NOT NULL`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_point" ALTER COLUMN "updatedAtDailyFirstNote" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "loginBonusAdditionalPoint"`);
    }
}
