import { Injectable } from '@nestjs/common';
import { LoanClient, Loan } from '../../infrastructure/adapters/in/LoanClientHTTP';
import { ProfileClient, Profile } from '../../infrastructure/adapters/in/ProfileClientHTTP';

export interface PaymentHistoryMetrics {
  totalPayments: number;
  onTimePayments: number;
  latePayments: number;
  onTimePercentage: number;
}

export interface DebtCapacityMetrics {
  monthlyIncome: number;
  totalDebt: number;
  monthlyPayment: number;
  debtRatio: number;
  paymentRatio: number;
  maxRecommendedLoan: number;
}

export interface CreditRecommendation {
  score: number;
  approved: boolean;
  maxAmount: number;
  risks: string[];
  recommendations: string[];
}

export interface CreditAnalysis {
  paymentHistory: PaymentHistoryMetrics;
  debtCapacity: DebtCapacityMetrics;
  punctuality: number;
  defaultLevel: number;
  recommendation: CreditRecommendation;
}

@Injectable()
export class CreditAnalysisService {
  constructor(
    private readonly profileClient: ProfileClient,
    private readonly loanClient: LoanClient,
  ) {}

  async analyzeClient(clientId: string): Promise<CreditAnalysis> {
    const profile = await this.profileClient.getProfile(clientId);
    const loans = await this.loanClient.getUserLoans(clientId);

    const paymentHistory = this.calculatePaymentHistory(loans);
    const debtCapacity = this.calculateDebtCapacity(profile, loans);
    const punctuality = this.calculatePunctuality(loans);
    const defaultLevel = this.calculateDefaultLevel(loans);

    return {
      paymentHistory,
      debtCapacity,
      punctuality,
      defaultLevel,
      recommendation: this.generateRecommendation(paymentHistory, debtCapacity),
    };
  }

  private calculatePaymentHistory(loans: Loan[]): PaymentHistoryMetrics {
    const totalPayments = loans.reduce((sum, loan) => sum + (loan.payments?.length ?? 0), 0);

    const onTimePayments = loans.reduce((sum, loan) => {
      const onTime = (loan.payments ?? []).filter((p) => {
        const paid = new Date(p.date).getTime();
        const due = new Date(p.dueDate).getTime();
        return Number.isFinite(paid) && Number.isFinite(due) && paid <= due;
      }).length;
      return sum + onTime;
    }, 0);

    const onTimePercentage = totalPayments === 0 ? 0 : (onTimePayments / totalPayments) * 100;

    return {
      totalPayments,
      onTimePayments,
      latePayments: totalPayments - onTimePayments,
      onTimePercentage,
    };
  }

  private calculateDebtCapacity(profile: Profile, loans: Loan[]): DebtCapacityMetrics {
    const monthlyIncome = profile.monthly_income ?? 0;

    const totalDebt = loans.reduce((sum, loan) => sum + (loan.remainingBalance ?? 0), 0);
    const monthlyPayment = loans.reduce((sum, loan) => sum + (loan.installmentValue ?? 0), 0);

    const debtRatio = monthlyIncome > 0 ? (totalDebt / monthlyIncome) * 100 : 0;
    const paymentRatio = monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 0;

    return {
      monthlyIncome,
      totalDebt,
      monthlyPayment,
      debtRatio,
      paymentRatio,
      maxRecommendedLoan: this.calculateMaxLoan(monthlyIncome, debtRatio),
    };
  }

  private calculateMaxLoan(monthlyIncome: number, currentDebtRatio: number): number {
    const maxDebtRatio = 40;
    const availableDebtRatio = maxDebtRatio - currentDebtRatio;
    if (monthlyIncome <= 0) return 0;
    if (availableDebtRatio <= 0) return 0;
    return (monthlyIncome * availableDebtRatio) / 100;
  }

  private calculatePunctuality(loans: Loan[]): number {
    return this.calculatePaymentHistory(loans).onTimePercentage;
  }

  private calculateDefaultLevel(loans: Loan[]): number {
    const ph = this.calculatePaymentHistory(loans);
    if (ph.totalPayments === 0) return 0;
    return (ph.latePayments / ph.totalPayments) * 100;
  }

  private generateRecommendation(
    paymentHistory: PaymentHistoryMetrics,
    debtCapacity: DebtCapacityMetrics,
  ): CreditRecommendation {
    let score = 100;
    const risks: string[] = [];
    const recommendations: string[] = [];

    if (paymentHistory.onTimePercentage < 80) {
      score -= 20;
      risks.push('Historial de pagos irregular');
      recommendations.push('Requiere garantía adicional');
    }

    if (debtCapacity.debtRatio > 40) {
      score -= 30;
      risks.push('Alta relación deuda/ingreso');
      recommendations.push('Reducir préstamo solicitado');
    }

    score = Math.max(0, Math.min(100, score));

    return {
      score,
      approved: score >= 60,
      maxAmount: debtCapacity.maxRecommendedLoan,
      risks,
      recommendations,
    };
  }
}