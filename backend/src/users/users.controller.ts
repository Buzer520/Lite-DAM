import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "./entities/user.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as fs from "fs";
import * as path from "path";

const avatarDir = path.join(process.cwd(), "uploads", "avatars");
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    @Query("search") search?: string,
  ) {
    return this.usersService.findAll(page, limit, search);
  }

  @Get("profile")
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    const { password, ...result } = user;
    return result;
  }

  @Put("profile")
  async updateProfile(@Request() req, @Body() updateDto: any) {
    const user = await this.usersService.updateProfile(
      req.user.userId,
      updateDto,
    );
    const { password, ...result } = user;
    return result;
  }

  @Put("change-password")
  async changePassword(
    @Request() req,
    @Body("oldPassword") oldPassword: string,
    @Body("newPassword") newPassword: string,
  ) {
    await this.usersService.changePassword(
      req.user.userId,
      oldPassword,
      newPassword,
    );
    return { message: "密码修改成功" };
  }

  @Post("avatar")
  @UseInterceptors(
    FileInterceptor("avatar", {
      storage: diskStorage({
        destination: avatarDir,
        filename: (req: any, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `avatar-${req.user.userId}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req: any, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error("Only image files are allowed"), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const avatarPath = `/uploads/avatars/${file.filename}`;
    const user = await this.usersService.updateProfile(req.user.userId, {
      avatar: avatarPath,
    });
    const { password, ...result } = user;
    return result;
  }

  @Put(":id/role")
  @Roles(UserRole.SUPER_ADMIN)
  async updateRole(@Param("id") id: string, @Body("role") role: UserRole) {
    const user = await this.usersService.updateRole(+id, role);
    const { password, ...result } = user;
    return result;
  }

  @Put(":id/toggle-active")
  @Roles(UserRole.SUPER_ADMIN)
  async toggleActive(@Param("id") id: string) {
    const user = await this.usersService.toggleActive(+id);
    const { password, ...result } = user;
    return result;
  }

  @Post(":id/reset-password")
  @Roles(UserRole.SUPER_ADMIN)
  async resetPassword(
    @Param("id") id: string,
    @Body("newPassword") newPassword: string,
  ) {
    await this.usersService.resetPassword(+id, newPassword);
    return { message: "Password reset successfully" };
  }

  @Delete(":id")
  @Roles(UserRole.SUPER_ADMIN)
  async remove(@Param("id") id: string) {
    await this.usersService.remove(+id);
    return { message: "User deleted successfully" };
  }
}
