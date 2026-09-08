import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Express } from 'express';
import { AppModule } from './app.module';
import { nestCorsOptions } from './cors-options';

export { nestCorsOptions } from './cors-options';

export type CreateNestAppOptions = {
  /** Encaminhado ao NestFactory (serverless usa bufferLogs). */
  bufferLogs?: boolean;
};

export async function createNestApp(
  expressApp?: Express,
  options: CreateNestAppOptions = {},
): Promise<INestApplication> {
  const nestOptions = options.bufferLogs ? { bufferLogs: true } : undefined;
  const app = expressApp
    ? await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
        nestOptions,
      )
    : await NestFactory.create(AppModule, nestOptions);

  app.enableCors(nestCorsOptions);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  return app;
}
