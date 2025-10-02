import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../domain/entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async getAuditLogs(filters: { from?: string; to?: string; userId?: string }) {
    const where: any = {};
    if (filters.userId) where.userId = filters.userId;
    // Puedes agregar lógica para filtrar por fechas si lo necesitas
    return this.auditLogRepository.find({ where });
  }
}