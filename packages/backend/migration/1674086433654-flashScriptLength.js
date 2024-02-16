/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class flashScriptLength1674086433654 {
    name = 'flashScriptLength1674086433654'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "flash" ALTER COLUMN "script" TYPE character varying(32768)`);
    }

    async down(queryRunner) {
			await queryRunner.query(`ALTER TABLE "flash" ALTER COLUMN "script" TYPE character varying(16384)`);
    }
}
