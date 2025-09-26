export class Metrics {
  userId: string;
  creditScore: number;
  pendingLoans: number;
  riskLevel: 'low' | 'medium' | 'high';

  constructor(data: Partial<Metrics>) {
    Object.assign(this, data);
  }

  calculateRisk(pendingLoans: number, totalLoans: number): 'low' | 'medium' | 'high' {
    if (pendingLoans === 0) return 'low';
    if (pendingLoans / totalLoans > 0.5) return 'high';
    return 'medium';
  }
}