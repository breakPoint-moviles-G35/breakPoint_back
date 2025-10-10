import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HostProfile } from './entities/host-profile.entity/host-profile.entity';
import { HostProfileService } from './host-profile.service';
import { HostProfileController } from './host-profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HostProfile])],
  controllers: [HostProfileController],
  providers: [HostProfileService],
  exports: [HostProfileService],
})
export class HostProfileModule {}
