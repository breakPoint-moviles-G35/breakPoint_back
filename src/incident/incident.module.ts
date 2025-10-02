import { Module } from '@nestjs/common';
import { IncidentEntity } from './entities/incident.entity/incident.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([IncidentEntity])],
})
export class IncidentModule {}
