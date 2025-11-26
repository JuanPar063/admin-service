export class MetricsDetailDto {
  clientId: string;
  creditScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  pendingLoans: number;
  totalLoans: number;
  calculatedAt: Date;
  updatedAt: Date;
}