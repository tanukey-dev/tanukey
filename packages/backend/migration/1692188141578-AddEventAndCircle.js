export class AddEventAndCircle1692188141578 {
	name = "AddEventAndCircle1692188141578";

	async up(queryRunner) {
		await queryRunner.query(
			`CREATE TABLE "circle" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" character varying(32), "name" character varying(128) NOT NULL, "description" character varying(8192), "profileImageId" character varying(32), CONSTRAINT "PK_9acc76020bf08433e769e72deb0" PRIMARY KEY ("id")); COMMENT ON COLUMN "circle"."createdAt" IS 'The created date of the Circle.'; COMMENT ON COLUMN "circle"."userId" IS 'The owner ID.'; COMMENT ON COLUMN "circle"."profileImageId" IS 'The ID of banner Channel.'`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_a3b0336ed34651a0885880bf56" ON "circle" ("createdAt") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_8ab9347a9d66b08f6a02eae155" ON "circle" ("userId") `,
		);
		await queryRunner.query(
			`CREATE TABLE "event" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" character varying(32), "name" character varying(128) NOT NULL, "description" character varying(8192), "bannerId" character varying(32), CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id")); COMMENT ON COLUMN "event"."createdAt" IS 'The created date of the Channel.'; COMMENT ON COLUMN "event"."userId" IS 'The owner ID.'`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_77b45e61f3194ba2be468b0778" ON "event" ("createdAt") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_01cd2b829e0263917bf570cb67" ON "event" ("userId") `,
		);
		await queryRunner.query(
			`CREATE TABLE "event_circle" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "eventId" character varying(32) NOT NULL, "circleId" character varying(32) NOT NULL, "description" character varying(8192), "circleImageId" character varying(32), CONSTRAINT "PK_cf99145f124e38980fec9ed5c22" PRIMARY KEY ("id")); COMMENT ON COLUMN "event_circle"."createdAt" IS 'The created date of the EventCircle.'`,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_7ebc653689f5fe580f1d9719c5" ON "event_circle" ("createdAt") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_f7e7eef6d2c9cbd544ad3c5ae9" ON "event_circle" ("eventId") `,
		);
		await queryRunner.query(
			`CREATE INDEX "IDX_38200a4a2663e8b41a46ffd32f" ON "event_circle" ("circleId") `,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_2fadd64e036dc1ca9d848b9286" ON "event_circle" ("eventId", "circleId") `,
		);
		await queryRunner.query(
			`ALTER TABLE "circle" ADD CONSTRAINT "FK_8ab9347a9d66b08f6a02eae1555" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "circle" ADD CONSTRAINT "FK_00cb14ad4d2adf015f70c82a843" FOREIGN KEY ("profileImageId") REFERENCES "drive_file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "event" ADD CONSTRAINT "FK_01cd2b829e0263917bf570cb672" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "event" ADD CONSTRAINT "FK_6597441f078156b81eacbfbf170" FOREIGN KEY ("bannerId") REFERENCES "drive_file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "event_circle" ADD CONSTRAINT "FK_f7e7eef6d2c9cbd544ad3c5ae9b" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "event_circle" ADD CONSTRAINT "FK_38200a4a2663e8b41a46ffd32f0" FOREIGN KEY ("circleId") REFERENCES "circle"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "event_circle" ADD CONSTRAINT "FK_030e788271a81b186000bf2f0cd" FOREIGN KEY ("circleImageId") REFERENCES "drive_file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
	}

	async down(queryRunner) {
		await queryRunner.query(
			`ALTER TABLE "event_circle" DROP CONSTRAINT "FK_030e788271a81b186000bf2f0cd"`,
		);
		await queryRunner.query(
			`ALTER TABLE "event_circle" DROP CONSTRAINT "FK_38200a4a2663e8b41a46ffd32f0"`,
		);
		await queryRunner.query(
			`ALTER TABLE "event_circle" DROP CONSTRAINT "FK_f7e7eef6d2c9cbd544ad3c5ae9b"`,
		);
		await queryRunner.query(
			`ALTER TABLE "event" DROP CONSTRAINT "FK_6597441f078156b81eacbfbf170"`,
		);
		await queryRunner.query(
			`ALTER TABLE "event" DROP CONSTRAINT "FK_01cd2b829e0263917bf570cb672"`,
		);
		await queryRunner.query(
			`ALTER TABLE "circle" DROP CONSTRAINT "FK_00cb14ad4d2adf015f70c82a843"`,
		);
		await queryRunner.query(
			`ALTER TABLE "circle" DROP CONSTRAINT "FK_8ab9347a9d66b08f6a02eae1555"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_2fadd64e036dc1ca9d848b9286"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_38200a4a2663e8b41a46ffd32f"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_f7e7eef6d2c9cbd544ad3c5ae9"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_7ebc653689f5fe580f1d9719c5"`,
		);
		await queryRunner.query(`DROP TABLE "event_circle"`);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_01cd2b829e0263917bf570cb67"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_77b45e61f3194ba2be468b0778"`,
		);
		await queryRunner.query(`DROP TABLE "event"`);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_8ab9347a9d66b08f6a02eae155"`,
		);
		await queryRunner.query(
			`DROP INDEX "public"."IDX_a3b0336ed34651a0885880bf56"`,
		);
		await queryRunner.query(`DROP TABLE "circle"`);
	}
}
