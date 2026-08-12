import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppLogger } from './common/logging/app.logger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(AppLogger);
  app.useLogger(logger);
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  const config = new DocumentBuilder().setTitle('AI Wardrobe API').setVersion('1.0.0').build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
  const port = app.get(ConfigService).getOrThrow<number>('API_PORT');
  await app.listen(port);
}
void bootstrap();
