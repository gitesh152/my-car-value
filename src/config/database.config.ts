import { registerAs } from '@nestjs/config';
import { join } from 'node:path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions.js';

export const databaseConfig = registerAs<
  PostgresConnectionOptions | SqliteConnectionOptions
>('database', () => {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd)
    return {
      type: 'postgres',
      database: process.env.DB_NAME,
      synchronize: false,
      autoLoadEntities: true,
      entities: [join(__dirname, 'dist/src/**/*.entity.js')],
      migrations: [join(__dirname, 'dist/src/migrations/**/*.js')],
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      ssl: {
        rejectUnauthorized: true,
      },
    } as PostgresConnectionOptions;
  else {
    return {
      type: 'sqlite',
      database: process.env.DB_NAME!,
      synchronize: false,
      autoLoadEntities: true,
      entities: [join(__dirname, 'src/**/*.entity.ts')],
      migrations: [join(__dirname, 'src/migrations/**/*.ts')],
    } as SqliteConnectionOptions;
  }
});
