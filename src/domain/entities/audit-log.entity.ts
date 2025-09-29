import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'admin_service', name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  admin_id: string;

  @Column()
  user_id: string;

  @Column()
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;
}