import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import type { ValidationError } from 'class-validator';
import { validateSync } from 'class-validator';

import { EnvironmentConfig } from './environment.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validate: (config) => {
        const validatedConfig = plainToClass(EnvironmentConfig, config);

        const errors = validateSync(validatedConfig);

        if (errors.length > 0) {
          const errorMessages = errors
            .map(
              (error: ValidationError) =>
                `Validation error for ${error.property}`,
            )
            .join('\n');

          throw new Error(errorMessages);
        }

        return config;
      },
      isGlobal: true,
    }), // choose between local db or neon by switching in the .env USE_ONLINE_DB=[0,1]
  ],
})
export class ConfigModule {}
