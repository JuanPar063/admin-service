import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Metrics } from '../../domain/entities/metrics.entity';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { Report } from '../../domain/entities/report.entity';
dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'postgress',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'admin123',
  database: process.env.DATABASE_NAME || 'admin_service_db',
  entities: [Metrics, AuditLog, Report],
  synchronize: true,
};