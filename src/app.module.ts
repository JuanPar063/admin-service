import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { MetricsService } from './application/services/metrics.service';
import { AuditLogService } from './application/services/audit-log.service';
import { ReportService } from './application/services/report.service';
import { AdminController } from './infrastructure/adapters/in/admin.controller';
import { LoanHttpAdapter } from './infrastructure/adapters/out/external/loan-http.adapter';
import { UserHttpAdapter } from './infrastructure/adapters/out/external/user-http.adapter';
import { Metrics } from './domain/entities/metrics.entity';
import { AuditLog } from './domain/entities/audit-log.entity';
import { Report } from './domain/entities/report.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // usuario
      password: 'admin123', // contraseña 
      database: 'admin_service_db', // nombre de la base de datos
      entities: [Metrics, AuditLog, Report], 
      synchronize: true, // Solo para desarrollo
    }),
    TypeOrmModule.forFeature([Metrics, AuditLog, Report]), 
    HttpModule,
    JwtModule.register({ secret: process.env.JWT_SECRET || 'secret' }), // Para validar JWT
  ],
  providers: [
    MetricsService,
    AuditLogService,
    ReportService,
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