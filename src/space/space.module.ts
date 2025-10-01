/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Space } from './entities/space.entity/space.entity';
import { SpaceController } from './space.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Space])],
  providers: [SpaceService],
  controllers: [SpaceController]
})
export class SpaceModule {}
