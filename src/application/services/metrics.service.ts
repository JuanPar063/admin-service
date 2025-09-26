import { Injectable } from '@nestjs/common';
import { GetMetricsPort } from '../../domain/ports/in/get-metrics.port';
import { LoanExternalPort } from '../../domain/ports/out/loan-external.port';
import { UserExternalPort } from '../../domain/ports/out/user-external.port';
import { Metrics } from '../../domain/entities/metrics.entity';

@Injectable()
export class MetricsService implements GetMetricsPort {
  constructor(
    private readonly loanExternal: LoanExternalPort,
    private readonly userExternal: UserExternalPort,
  ) {}

  async getMetrics(userId: string): Promise<Metrics> {
    const user = await this.userExternal.getUser (userId);
    if (!user || user.role !== 'client') throw new Error('Invalid user for metrics');
    
    const loansData = await this.loanExternal.getLoansByUser (userId);
    const creditScore = 100 - (loansData.pendingLoans * 10); // Lógica simple
    const metrics = new Metrics({
      userId,
      creditScore: Math.max(0, creditScore),
      pendingLoans: loansData.pendingLoans,
      riskLevel: new Metrics({}).calculateRisk(loansData.pendingLoans, loansData.totalLoans),
    });
    return metrics;
  }
}