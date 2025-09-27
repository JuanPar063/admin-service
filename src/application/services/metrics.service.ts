import { Injectable, Inject } from '@nestjs/common';
import { GetMetricsPort } from '../../domain/ports/in/get-metrics.port';
import type { LoanExternalPort } from '../../domain/ports/out/loan-external.port';
import type { UserExternalPort } from '../../domain/ports/out/user-external.port';
import { Metrics } from '../../domain/entities/metrics.entity';

@Injectable()
export class MetricsService implements GetMetricsPort {
  constructor(
    @Inject('LoanExternalPort') private readonly loanExternal: LoanExternalPort,
    @Inject('UserExternalPort') private readonly userExternal: UserExternalPort,
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