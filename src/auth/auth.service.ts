import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user/user.entity';
import { UserService } from 'src/user/user.service';



@Injectable()
export class AuthService {
  constructor(private users: UserService, private jwt: JwtService) {}

  async register(dto: CreateUserDto) {
    const exists = await this.users.findByEmail(dto.email);

    //Contraseña no puede ser vacia
    if(!dto.password || dto.password.trim().length === 0){
      throw new BadRequestException('La contraseña no puede ser vacía');
    }
    if (exists) throw new ConflictException('Email ya registrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.create({
      email: dto.email,
      password: hash,
      name: dto.name,
      role: dto.role,
    });
    return this.sanitize(user);
  }

  async validateUser(email: string, pass: string) {
    const user = await this.users.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    return this.sanitize(user);
  }

  async login(user: { id: number; email: string; role?: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role || 'user' };
    return {
      access_token: await this.jwt.signAsync(payload),
      user,
    };
  }

  async changePassword(userId:string ,newPassword: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await this.users.updateUser(user);
    if(!user){
      throw new BadRequestException('Error al cambiar la contraseña');
    }
    return { message: 'Contraseña cambiada exitosamente' };
  }

  private sanitize(user: User) {
    const { ...rest } = user;
    return rest;
  }
}
