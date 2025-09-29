import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  console.log(`Metrics: http://localhost:${port}/admin/metrics`);
  console.log(`Audit logs:    http://localhost:${port}/admin/audit-logs`);
  console.log(`Reports:       http://localhost:${port}/admin/reports`);
}
bootstrap();