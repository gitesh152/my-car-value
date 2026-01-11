import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions.js';

dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});

const isProd = process.env.NODE_ENV === 'production';

const common = {
  synchronize: false,
  database: process.env.DB_NAME!,

  // compiled JS in production (with npm run build)
  // TS source in dev/test (without npm run build)
  entities: [
    join(__dirname, isProd ? 'dist/src/**/*.entity.js' : 'src/**/*.entity.ts'),
  ],

  migrations: [
    join(
      __dirname,
      isProd ? 'dist/src/migrations/**/*.js' : 'src/migrations/**/*.ts',
    ),
  ],
};

const sqliteOptions: SqliteConnectionOptions = {
  type: 'sqlite',
  ...common,
};

const postgresOptions: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER!,
  password: process.env.DB_PASS!,
  ssl: {
    rejectUnauthorized: true,
  },
  ...common,
};

export const AppDataSource = new DataSource(
  isProd ? postgresOptions : sqliteOptions,
);
