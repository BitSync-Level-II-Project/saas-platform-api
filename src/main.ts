import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './configure-app.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  configureApp(app);

  const host = process.env.HOST ??
    (process.env.NODE_ENV === 'development' ? '127.0.0.1' : '0.0.0.0');
  await app.listen(Number(process.env.PORT ?? 3000), host);
}

void bootstrap();
