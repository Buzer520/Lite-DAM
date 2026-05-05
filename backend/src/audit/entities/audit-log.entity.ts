import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne('User', 'auditLogs')
  @JoinColumn({ name: 'userId' })
  user: any;

  @Column()
  action: string;

  @Column({ nullable: true })
  targetType: string;

  @Column({ nullable: true })
  targetId: number;

  @Column({ nullable: true })
  details: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  timestamp: Date;
}
