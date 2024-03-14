export class DeleteAdditionalPointToRoleSetting1710250433990 {
    name = 'DeleteAdditionalPointToRoleSetting1710250433990'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "loginBonusAdditionalPoint"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "role" ADD "loginBonusAdditionalPoint" integer NOT NULL DEFAULT '0'`);
    }
}
