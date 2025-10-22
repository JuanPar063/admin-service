import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogDto } from '../../infrastructure/dto/audit-log.dto';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Obtiene los registros de auditoría con filtros opcionales por fecha o usuario.
   */
  async getAuditLogs(filters: { from?: string; to?: string; userId?: string }): Promise<AuditLogDto[]> {
    const where: any = {};

    // Filtrar por usuario si se proporciona
    if (filters.userId) {
      where.user_id = filters.userId;
      this.logger.log(`Filtrando logs por usuario: ${filters.userId}`);
    }

    // Filtrar por rango de fechas si ambos valores se proporcionan
    if (filters.from && filters.to) {
      where.timestamp = Between(new Date(filters.from), new Date(filters.to));
      this.logger.log(`Filtrando logs desde ${filters.from} hasta ${filters.to}`);
    }

    try {
      const logs = await this.auditLogRepository.find({ where });
      this.logger.debug(`Se encontraron ${logs.length} registro(s) de auditoría`);

      return logs.map((log) => ({
        id: log.id,
        userId: log.user_id,
        action: log.action,
        entityId: log.admin_id,
        metadata: log.details,
        createdAt: log.timestamp,
      }));
    } catch (error) {
      this.logger.error('Error al obtener los registros de auditoría', error.stack);
      throw new BadRequestException('Ocurrió un error al consultar los registros de auditoría');
    }
  }
}
