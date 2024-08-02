import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from './auth/auth.module';
import { UserStrategy } from './common/strategies/user.strategy';
import { ConfigModule } from './core/config/config.module';
import { loggerConfig } from './core/config/logger.config';
import { DatabaseModule } from './core/databases/database.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    LoggerModule.forRoot(loggerConfig),
    UserModule,
    AuthModule,
    TaskModule,
  ],
  controllers: [],
  providers: [UserStrategy],
})
export class AppModule {}
