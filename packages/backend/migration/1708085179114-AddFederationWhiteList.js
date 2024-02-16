export class AddFederationWhiteList1708085179114 {
    name = 'AddFederationWhiteList1708085179114'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" ADD "enableAllowedHostsInWhiteList" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "meta" ADD "allowedHosts" character varying(1024) array NOT NULL DEFAULT '{}'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "allowedHosts"`);
        await queryRunner.query(`ALTER TABLE "meta" DROP COLUMN "enableAllowedHostsInWhiteList"`);
    }
}
