import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { env } from 'node:process';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = env.PORT || 4000;

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(cookieParser());
  await app.listen(port);
}
bootstrap();
