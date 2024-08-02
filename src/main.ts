import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from './core/filters/global-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    cors: true,
  });

  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.useBodyParser('json', { limit: '1mb' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('API for managing tasks')
    .setVersion('1.2')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.API_PORT || 3000);
}

void bootstrap();
