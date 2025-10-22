import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../domain/entities/report.entity';
import { ReportDto } from '../../infrastructure/dto/report.dto';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  /**
   * Crea un nuevo reporte en la base de datos.
   * Incluye validación básica y registros en consola.
   */
  async createReport(data: Partial<Report>): Promise<Report> {
    if (!data.period) {
      this.logger.warn('Intento de crear un reporte sin periodo definido');
      throw new BadRequestException('El reporte debe tener un periodo definido');
    }

    const report = this.reportRepository.create(data);
    this.logger.log(`Creando reporte para el periodo: ${data.period}`);

    try {
      const saved = await this.reportRepository.save(report);
      this.logger.debug(`Reporte creado correctamente con ID: ${saved.id}`);
      return saved;
    } catch (error) {
      this.logger.error('Error al crear el reporte', error.stack);
      throw new BadRequestException('Error al guardar el reporte en la base de datos');
    }
  }

  /**
   * Retorna todos los reportes disponibles en el sistema.
   */
  async findAll(): Promise<Report[]> {
    this.logger.log('Consultando todos los reportes disponibles');
    return this.reportRepository.find();
  }

  /**
   * Retorna reportes filtrados como DTOs.
   * Incluye manejo de errores y mensajes en español.
   */
  async getReports(filters: { period?: string }): Promise<ReportDto[]> {
    const where: any = {};
    if (filters.period) where.period = filters.period;

    this.logger.log(
      filters.period
        ? `Consultando reportes del periodo: ${filters.period}`
        : 'Consultando todos los reportes (sin filtros)',
    );

    try {
      const reports = await this.reportRepository.find({ where });
      this.logger.debug(`Se encontraron ${reports.length} reporte(s)`);

      return reports.map((report) => ({
        id: report.id,
        period: report.period,
        totalClientsHighRisk: report.total_clients_high_risk,
        averageCreditScore: report.average_credit_score,
        totalPendingLoans: report.total_pending_loans,
        generatedAt: report.generated_at,
      }));
    } catch (error) {
      this.logger.error('Error al obtener los reportes', error.stack);
      throw new BadRequestException('Ocurrió un error al consultar los reportes');
    }
  }
}
