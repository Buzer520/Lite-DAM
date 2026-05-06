import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "./entities/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, phone, password } = createUserDto;

    if (!username) {
      throw new BadRequestException("用户名不能为空");
    }

    const existingUser = await this.findOneByUsername(username);
    if (existingUser) {
      throw new ConflictException("用户名已存在");
    }

    if (email) {
      const existingEmail = await this.findOneByEmail(email);
      if (existingEmail) {
        throw new ConflictException("邮箱已被注册");
      }
    }

    if (phone) {
      const existingPhone = await this.findOneByPhone(phone);
      if (existingPhone) {
        throw new ConflictException("手机号已被注册");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      username,
      email: email || null,
      phone: phone || null,
      password: hashedPassword,
      role: UserRole.USER,
      isActive: true,
    });

    return this.userRepository.save(user);
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOneByPhone(phone: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async findOneByLoginIdentifier(
    identifier: string,
  ): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: [
        { username: identifier },
        { email: identifier },
        { phone: identifier },
      ],
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async findAll(
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<{ users: User[]; total: number }> {
    const queryBuilder = this.userRepository.createQueryBuilder("user");
    queryBuilder.select([
      "user.id",
      "user.username",
      "user.email",
      "user.phone",
      "user.role",
      "user.isActive",
      "user.nickname",
      "user.avatar",
      "user.storageUsed",
      "user.storageQuota",
      "user.createdAt",
    ]);

    if (search) {
      queryBuilder.where(
        "user.username LIKE :search OR user.email LIKE :search",
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("user.createdAt", "DESC");

    const [users, total] = await queryBuilder.getManyAndCount();

    return { users, total };
  }

  async updateRole(userId: number, role: UserRole): Promise<User> {
    const user = await this.findById(userId);
    user.role = role;
    return this.userRepository.save(user);
  }

  async toggleActive(userId: number): Promise<User> {
    const user = await this.findById(userId);
    user.isActive = !user.isActive;
    return this.userRepository.save(user);
  }

  async updateProfile(
    userId: number,
    updateDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findById(userId);

    if (updateDto.nickname !== undefined) {
      user.nickname = updateDto.nickname;
    }
    if (updateDto.avatar !== undefined) {
      user.avatar = updateDto.avatar;
    }
    if (updateDto.themeColor !== undefined) {
      user.themeColor = updateDto.themeColor;
    }
    if (updateDto.darkMode !== undefined) {
      user.darkMode = updateDto.darkMode;
    }

    return this.userRepository.save(user);
  }

  async updateStorageUsed(userId: number, sizeChange: number): Promise<User> {
    const user = await this.findById(userId);
    user.storageUsed = Math.max(0, user.storageUsed + sizeChange);
    return this.userRepository.save(user);
  }

  async resetPassword(userId: number, newPassword: string): Promise<User> {
    const user = await this.findById(userId);
    user.password = await bcrypt.hash(newPassword, 10);
    return this.userRepository.save(user);
  }

  async remove(userId: number): Promise<void> {
    await this.userRepository.delete(userId);
  }
}

export interface CreateUserDto {
  username?: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface UpdateProfileDto {
  nickname?: string;
  avatar?: string;
  themeColor?: string;
  darkMode?: boolean;
}
