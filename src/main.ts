import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);

  // Configuración Swagger
  const config = new DocumentBuilder()
    .setTitle('Admin Service API')
    .setDescription('Documentación automática de la API del servicio de administración')
    .setVersion('1.0')
    .addBearerAuth() // quítalo si no usas JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  
  await app.listen(port);
  console.log(`🚀 Admin Service running at: http://localhost:${port}`);
  console.log(`📄 Swagger docs available at: http://localhost:${port}/api/docs`);
  console.log(`Metrics: http://localhost:${port}/admin/metrics`);
  console.log(`Audit logs:    http://localhost:${port}/admin/audit-logs`);
  console.log(`Reports:       http://localhost:${port}/admin/reports`);
}
bootstrap();