import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config/config.validation';
import { applicationConfig } from './config/application.config';
import { databaseConfig } from './config/database.config';
import cookieSession from 'cookie-session';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      // NOTE: Below env is loaded from script using cross-env in development
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [applicationConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow('database'),
    }),
    UsersModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
    AppService,
  ],
})
export class AppModule {
  constructor(private readonly configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: [
            this.configService.getOrThrow<string>('application.cookieKey'),
          ],
        }),
      )
      .forRoutes('*');
  }
}
