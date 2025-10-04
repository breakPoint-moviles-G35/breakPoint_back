
import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from './entities/space.entity/space.entity';
import { SpaceController } from './space.controller';
import { HostProfile } from 'src/host-profile/entities/host-profile.entity/host-profile.entity';
import { ReviewModule } from '../review/review.module';
import { HostProfileModule } from '../host-profile/host-profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Space, HostProfile]),
    ReviewModule,
    HostProfileModule,
  ],
  providers: [SpaceService],
  controllers: [SpaceController],
  exports: [SpaceService],
})
export class SpaceModule {}
