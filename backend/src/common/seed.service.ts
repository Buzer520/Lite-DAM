import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.createSuperAdmin();
  }

  private async createSuperAdmin() {
    const existingSuperAdmin = await this.userRepository.findOne({
      where: { role: UserRole.SUPER_ADMIN },
    });

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const superAdmin = this.userRepository.create({
        username: 'admin',
        email: 'admin@lite-dam.com',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        nickname: '系统管理员',
        isActive: true,
      });
      await this.userRepository.save(superAdmin);
      console.log('Super admin account created: admin / admin123');
    }
  }
}
