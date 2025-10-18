
import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from './entities/space.entity/space.entity';
import { SpaceController } from './space.controller';
import { HostProfile } from 'src/host-profile/entities/host-profile.entity/host-profile.entity';
import { Booking } from 'src/booking/entities/booking.entity/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Space, HostProfile, Booking])],
  providers: [SpaceService],
  controllers: [SpaceController]
})
export class SpaceModule {}
