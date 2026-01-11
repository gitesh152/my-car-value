import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1768070804567 implements MigrationInterface {
  name = 'Init1768070804567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reports" ("id" SERIAL NOT NULL, "price" integer NOT NULL, "approved" boolean NOT NULL DEFAULT false, "make" character varying NOT NULL, "model" character varying NOT NULL, "year" integer NOT NULL, "lat" integer NOT NULL, "lon" integer NOT NULL, "mileage" integer NOT NULL, "userId" integer, CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" text NOT NULL DEFAULT 'user', CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD CONSTRAINT "FK_bed415cd29716cd707e9cb3c09c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reports" DROP CONSTRAINT "FK_bed415cd29716cd707e9cb3c09c"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "reports"`);
  }
}
