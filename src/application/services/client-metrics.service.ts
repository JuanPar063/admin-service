import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Metrics } from '../../domain/entities/metrics.entity';
import { MetricsDetailDto } from '../../infrastructure/dto/metrics-detail.dto';

@Injectable()
export class ClientMetricsService {
  private readonly logger = new Logger(ClientMetricsService.name);

  constructor(
    @InjectRepository(Metrics)
    private readonly metricsRepository: Repository<Metrics>,
  ) {}


  async getClientMetrics(clientId: string): Promise<MetricsDetailDto> {
    this.logger.log(`Obteniendo métricas detalladas para el cliente: ${clientId}`);

    try {
      const metrics = await this.metricsRepository.findOne({
        where: { user_id: clientId },
      });

      if (!metrics) {
        this.logger.warn(`No se encontraron métricas para el cliente: ${clientId}`);
        throw new BadRequestException(
          `No existen métricas registradas para el cliente ${clientId}`,
        );
      }

      this.logger.debug(
        `Métricas encontradas - Score: ${metrics.credit_score}, Riesgo: ${metrics.risk_level}`,
      );

      // 
      return this.mapToDto(metrics);
    } catch (error) {
      this.logger.error(
        `Error al obtener métricas del cliente ${clientId}`,
        (error as Error).stack,
      );
      // 
      throw new BadRequestException('Error al consultar las métricas del cliente');
    }
  }


  async exportClientMetrics(clientId: string): Promise<{
    clientId: string;
    summary: MetricsDetailDto;
    analysis: {
      riskAssessment: string;
      creditWorthiness: string;
      recommendations: string[];
    };
  }> {
    this.logger.log(`Exportando métricas del cliente: ${clientId}`);

    const metrics = await this.getClientMetrics(clientId);

    const analysis = {
      riskAssessment: this.assessRisk(
        metrics.riskLevel,
        metrics.pendingLoans,
        metrics.totalLoans,
      ),
      creditWorthiness: this.assessCreditWorthiness(metrics.creditScore),
      recommendations: this.generateRecommendations(metrics),
    };

    return {
      clientId,
      summary: metrics,
      analysis,
    };
  }


  async getMultipleClientsMetrics(
    clientIds: string[],
  ): Promise<MetricsDetailDto[]> {
    this.logger.log(`Obteniendo métricas para ${clientIds.length} clientes`);

    try {
      const metrics = await this.metricsRepository.find({
        where: clientIds.map((id) => ({ user_id: id })),
      });

      // 
      return metrics.map((m) => this.mapToDto(m));
    } catch (error) {
      this.logger.error('Error al obtener métricas múltiples', (error as Error).stack);
      throw new BadRequestException('Error al consultar las métricas de los clientes');
    }
  }

  // 🔹 Helper para no repetir el mapeo entidad -> DTO
  private mapToDto(entity: Metrics): MetricsDetailDto {
    return {
      clientId: entity.user_id,
      creditScore: entity.credit_score,
      riskLevel: entity.risk_level,
      pendingLoans: entity.pending_loans,
      totalLoans: entity.total_loans,
      calculatedAt: entity.calculated_at,
      updatedAt: entity.updated_at,
    };
  }

  private assessRisk(riskLevel: string, pending: number, total: number): string {
    if (riskLevel === 'high') {
      return `ALTO - ${pending}/${total} préstamos pendientes. Cliente requiere seguimiento inmediato.`;
    }
    if (riskLevel === 'medium') {
      return `MEDIO - ${pending} préstamos pendientes. Recomendado monitoreo regular.`;
    }
    return `BAJO - Cliente con buen comportamiento de pago.`;
  }

  private assessCreditWorthiness(creditScore: number): string {
    if (creditScore >= 80) return 'EXCELENTE - Apto para créditos mayores';
    if (creditScore >= 60) return 'BUENO - Apto para créditos estándar';
    if (creditScore >= 40) return 'REGULAR - Limitaciones en monto';
    return 'DEFICIENTE - Requiere evaluación especial';
  }

  private generateRecommendations(metrics: MetricsDetailDto): string[] {
    const recommendations: string[] = [];

    if (metrics.creditScore < 50) {
      recommendations.push('Contactar al cliente para plan de recuperación');
    }
    if (metrics.pendingLoans > metrics.totalLoans * 0.5) {
      recommendations.push('Evaluar capacidad de pago adicional');
    }
    if (metrics.riskLevel === 'high') {
      recommendations.push('Requerir garantía adicional para nuevos créditos');
    }
    if (metrics.pendingLoans === 0) {
      recommendations.push('Cliente apto para incremento de línea de crédito');
    }

    return recommendations.length > 0
      ? recommendations
      : ['Continuar seguimiento regular'];
  }
}
