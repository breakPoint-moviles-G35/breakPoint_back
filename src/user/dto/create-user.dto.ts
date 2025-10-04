

import { IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "../entities/user/user.entity";
import { Column } from "typeorm";



export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;
}
