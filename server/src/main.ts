import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  // ─── Валидация критических переменных окружения ───
  const requiredEnvVars = ['JWT_SECRET', 'BOT_TOKEN', 'DATABASE_URL'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ FATAL: ${envVar} is not set in .env`);
      process.exit(1);
    }
  }

  if (process.env.JWT_SECRET === 'default-secret-change-me') {
    console.error('❌ FATAL: JWT_SECRET is set to default value. Change it!');
    process.exit(1);
  }

  if (process.env.JWT_SECRET!.length < 32) {
    console.error('❌ FATAL: JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Cookie parser
  app.use(cookieParser());

  // CORS
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''));

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.log('🔒 Allowed CORS origins:', allowedOrigins);
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Helmet с CSP
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: isProduction ? undefined : false,
    }),
  );

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filter & interceptor
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Spectre Backend running on http://localhost:${port}`);
}

bootstrap();
