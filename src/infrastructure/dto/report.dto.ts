export class ReportDto {
  id: string;
  period: string;
  totalClientsHighRisk: number;
  averageCreditScore: number;
  totalPendingLoans: number;
  generatedAt: Date;
}
