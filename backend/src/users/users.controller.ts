import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(page, limit, search);
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    const { password, ...result } = user;
    return result;
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateDto: any) {
    const user = await this.usersService.updateProfile(req.user.userId, updateDto);
    const { password, ...result } = user;
    return result;
  }

  @Put(':id/role')
  @Roles(UserRole.SUPER_ADMIN)
  async updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    const user = await this.usersService.updateRole(+id, role);
    const { password, ...result } = user;
    return result;
  }

  @Put(':id/toggle-active')
  @Roles(UserRole.SUPER_ADMIN)
  async toggleActive(@Param('id') id: string) {
    const user = await this.usersService.toggleActive(+id);
    const { password, ...result } = user;
    return result;
  }

  @Post(':id/reset-password')
  @Roles(UserRole.SUPER_ADMIN)
  async resetPassword(@Param('id') id: string, @Body('newPassword') newPassword: string) {
    await this.usersService.resetPassword(+id, newPassword);
    return { message: 'Password reset successfully' };
  }
}
