import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'admin_service', name: 'reports' })
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  period: string;

  @Column({ type: 'int' })
  total_clients_high_risk: number;

  @Column({ type: 'numeric' })
  average_credit_score: number;

  @Column({ type: 'int' })
  total_pending_loans: number;

  @CreateDateColumn({ type: 'timestamp' })
  generated_at: Date;
}
