import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  console.log(`App running at: http://localhost:${process.env.PORT ?? 3000}/admin/metrics/243`);
}
bootstrap();
