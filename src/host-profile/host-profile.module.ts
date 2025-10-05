import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HostProfile } from './entities/host-profile.entity/host-profile.entity';
import { HostProfileService } from './host-profile.service';
import { HostProfileController } from './host-profile.controller';
import { User } from 'src/user/entities/user/user.entity';
import { Space } from 'src/space/entities/space.entity/space.entity';

@Module({
    imports: [TypeOrmModule.forFeature([HostProfile, User, Space])],
    controllers: [HostProfileController],
    providers: [HostProfileService],
    exports: [HostProfileService],
})
export class HostProfileModule {}
