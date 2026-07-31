import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');

  // Set API prefix
  app.setGlobalPrefix('api');

  // Enable CORS for frontend integration
  app.enableCors({
    origin: '*', // In production, customize this to your specific frontend domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable validation globally using class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip any properties not in the DTO
      forbidNonWhitelisted: true, // throw an error if unapproved fields exist
      transform: true, // transform payloads to match class types
    }),
  );

  // Apply standardized response transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Apply custom http exception filter for unified error shapes
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);
  console.log(`🚀 Productivity Backend listening on http://localhost:${port}/api`);
}

bootstrap();
