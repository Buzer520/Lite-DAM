import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        nickname: user.nickname,
        avatar: user.avatar,
        storageUsed: user.storageUsed,
        storageQuota: user.storageQuota,
        themeColor: user.themeColor,
        darkMode: user.darkMode,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByLoginIdentifier(
      loginDto.username,
    );
    if (!user) {
      throw new UnauthorizedException("用户名、邮箱或手机号错误");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("账号已被禁用，请联系管理员");
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("密码错误");
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        nickname: user.nickname,
        avatar: user.avatar,
        storageUsed: user.storageUsed,
        storageQuota: user.storageQuota,
        themeColor: user.themeColor,
        darkMode: user.darkMode,
      },
    };
  }
}

export interface RegisterDto {
  username?: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}
