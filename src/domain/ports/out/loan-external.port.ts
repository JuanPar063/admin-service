export interface LoanExternalPort {
  getLoansByUser (userId: string): Promise<{ totalLoans: number; pendingLoans: number }>;
}