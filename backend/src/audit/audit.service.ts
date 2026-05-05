import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    return this.auditLogRepository.save(auditLog);
  }

  async log(data: CreateAuditLogDto): Promise<AuditLog> {
    return this.create(data);
  }

  async findAll(page = 1, limit = 20, filters: AuditFilters = {}): Promise<{ logs: AuditLog[], total: number }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .select(['log.id', 'log.action', 'log.targetType', 'log.targetId', 'log.details', 'log.ipAddress', 'log.timestamp', 'user.username', 'user.nickname']);

    if (filters.userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters.action) {
      queryBuilder.andWhere('log.action = :action', { action: filters.action });
    }

    queryBuilder.skip((page - 1) * limit).take(limit).orderBy('log.timestamp', 'DESC');

    const [logs, total] = await queryBuilder.getManyAndCount();

    return { logs, total };
  }
}

export interface CreateAuditLogDto {
  userId: number;
  action: string;
  targetType?: string;
  targetId?: number;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditFilters {
  userId?: number;
  action?: string;
}
