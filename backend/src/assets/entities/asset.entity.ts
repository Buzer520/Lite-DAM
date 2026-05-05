import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  originalName: string;

  @Column()
  filePath: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  category: string;

  @Column('simple-array', { nullable: true })
  aiTags: string[];

  @Column({ nullable: true })
  folder: string;

  @Column()
  ownerId: number;

  @ManyToOne('User', 'assets')
  @JoinColumn({ name: 'ownerId' })
  owner: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
