import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLog } from './entities/event-log.entity/event-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EventLog])],
})
export class EventLogModule {}
