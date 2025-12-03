/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from 'src/user/entities/user/user.entity';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.auth.register(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: any) {
    return this.auth.login(req.user);
  }

  @Roles(UserRole.ADMIN,UserRole.STUDENT)
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Get('profile')
  me(@Req() req: any) {
    return req.user;
  }

  @Post('ch-password')
  async changePassword(@Body() body: { userId: string; newPassword: string }) {
    const user = await this.auth.changePassword(body.userId, body.newPassword);
    return user;
  }
}
