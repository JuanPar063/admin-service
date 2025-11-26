import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MetricsService } from './application/services/metrics.service';
import { ClientMetricsService } from './application/services/client-metrics.service';
import { AuditLogService } from './application/services/audit-log.service';
import { ReportService } from './application/services/report.service';
import { ExternalUserService } from './application/services/external-user.service';
import { AdminController } from './infrastructure/adapters/in/admin.controller';
import { LoanHttpAdapter } from './infrastructure/adapters/out/external/loan-http.adapter';
import { UserHttpAdapter } from './infrastructure/adapters/out/external/user-http.adapter';
import { Metrics } from './domain/entities/metrics.entity';
import { AuditLog } from './domain/entities/audit-log.entity';
import { Report } from './domain/entities/report.entity';

@Module({
  imports: [
    // Cargar variables de entorno PRIMERO
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM con variables de entorno
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres-admin-service',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'admin123',
      database: process.env.DB_NAME || 'admin_service_db',
      entities: [Metrics, AuditLog, Report],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      autoLoadEntities: true,
      retryAttempts: 5,
      retryDelay: 3000,
    }),

    TypeOrmModule.forFeature([Metrics, AuditLog, Report]),
    HttpModule,
    JwtModule.register({ 
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [
    MetricsService,
    ClientMetricsService,
    AuditLogService,
    ReportService,
    ExternalUserService,
    {
      provide: 'LoanExternalPort',
      useClass: LoanHttpAdapter,
    },
    {
      provide: 'UserExternalPort',
      useClass: UserHttpAdapter,
    },
  ],
  controllers: [AdminController],
})
export class AppModule {}