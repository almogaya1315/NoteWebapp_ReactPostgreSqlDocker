import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as client from 'prom-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Add global API prefix
  app.setGlobalPrefix('api');

  //Enable CORS so frontend (http://localhost:5173) can talk to backend
  app.enableCors({
    origin: ['http://localhost:5173'], // allow frontend dev server
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  //Prometheus metrics
  const collectDefaultMetrics = client.collectDefaultMetrics;
  collectDefaultMetrics();

  //Start server
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}`);
}
bootstrap();
