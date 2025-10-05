import { Module } from '@nestjs/common';
import { Booking } from './entities/booking.entity/booking.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Space } from 'src/space/entities/space.entity/space.entity';
import { User } from 'src/user/entities/user/user.entity';
import { EventLog } from 'src/event-log/entities/event-log.entity/event-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Booking, Space, User, EventLog])],
    providers: [BookingService],
    controllers: [BookingController],
})
export class BookingModule{}
