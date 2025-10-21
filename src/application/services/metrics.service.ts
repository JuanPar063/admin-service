import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetMetricsPort } from '../../domain/ports/in/get-metrics.port';
import type { LoanExternalPort } from '../../domain/ports/out/loan-external.port';
import type { UserExternalPort } from '../../domain/ports/out/user-external.port';
import { Metrics } from '../../domain/entities/metrics.entity';
import { GetMetricsDto } from '../../infrastructure/dto/get-metrics.dto';

@Injectable()
export class MetricsService implements GetMetricsPort {
  constructor(
    @InjectRepository(Metrics)
    private readonly metricsRepository: Repository<Metrics>,
    @Inject('LoanExternalPort') private readonly loanExternal: LoanExternalPort,
    @Inject('UserExternalPort') private readonly userExternal: UserExternalPort,
  ) {}

  async getMetrics(userId: string): Promise<GetMetricsDto> {
  // Busca si ya existen métricas para ese usuario
  let metrics = await this.metricsRepository.findOne({ where: { user_id: userId } });

  if (!metrics) {
    // Si no existen, calcula y guarda nuevas métricas
    const user = await this.userExternal.getUser(userId);
    if (!user || user.role !== 'client') throw new Error('Invalid user for metrics');
    const loansData = await this.loanExternal.getLoansByUser(userId);
    const creditScore = 100 - (loansData.pendingLoans * 10);

    metrics = this.metricsRepository.create({
      user_id: userId,
      credit_score: Math.max(0, creditScore),
      pending_loans: loansData.pendingLoans,
      total_loans: loansData.totalLoans,
      risk_level: this.calculateRisk(loansData.pendingLoans, loansData.totalLoans),
    });

    await this.metricsRepository.save(metrics);
  }

  // Retorna el DTO
  return {
  userId: metrics.user_id,
  loansCount: metrics.total_loans,
  totalAmount: 0, 
  lastActivityAt: metrics.calculated_at,
};

}
  // Método para obtener todas las métricas con paginación
  async getAllMetrics(page?: number, limit?: number): Promise<{ data: Metrics[]; total: number; page: number; limit: number }> {
    const currentPage = page || 1;
    const currentLimit = limit || 10;
    const skip = (currentPage - 1) * currentLimit;

    const [data, total] = await this.metricsRepository.findAndCount({
      skip,
      take: currentLimit,
      order: { calculated_at: 'DESC' }
    });

    return {
      data,
      total,
      page: currentPage,
      limit: currentLimit
    };
  }


  // Método auxiliar para calcular el riesgo
  private calculateRisk(pendingLoans: number, totalLoans: number): 'low' | 'medium' | 'high' {
    if (pendingLoans === 0) return 'low';
    if (pendingLoans / totalLoans > 0.5) return 'high';
    return 'medium';
  }
}