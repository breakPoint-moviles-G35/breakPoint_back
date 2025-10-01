import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HostProfile } from './entities/host-profile.entity/host-profile.entity';

@Module({
    imports: [TypeOrmModule.forFeature([HostProfile])],
})
export class HostProfileModule {}
