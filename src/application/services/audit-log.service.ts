import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogDto } from '../../infrastructure/dto/audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async getAuditLogs(filters: { from?: string; to?: string; userId?: string }): Promise<AuditLogDto[]> {
  const where: any = {};
  if (filters.userId) where.user_id = filters.userId;
  // Puedes agregar lógica para filtrar por fechas si lo necesitas
  const logs = await this.auditLogRepository.find({ where });
  return logs.map(log => ({
    id: log.id,
    userId: log.user_id,
    action: log.action,
    entityId: log.admin_id, 
    metadata: log.details,
    createdAt: log.timestamp,
  }));
}
}
