import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user/user.entity';
import { HostProfile } from 'src/host-profile/entities/host-profile.entity/host-profile.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, HostProfile])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
