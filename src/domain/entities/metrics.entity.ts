import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'admin_service', name: 'metrics' })
export class Metrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ type: 'int' })
  credit_score: number;

  @Column({ type: 'int' })
  pending_loans: number;

  @Column({ type: 'int' })
  total_loans: number;

  @Column({ type: 'varchar' })
  risk_level: 'low' | 'medium' | 'high';

  @CreateDateColumn({ type: 'timestamp', name: 'calculated_at' })
  calculated_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updated_at: Date;
}