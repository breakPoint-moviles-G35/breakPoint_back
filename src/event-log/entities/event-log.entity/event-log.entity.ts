/* eslint-disable prettier/prettier */
import { Booking } from 'src/booking/entities/booking.entity/booking.entity';
import { User } from 'src/user/entities/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity()
export class EventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.eventLogs, { nullable: true })
  user: User;

  @ManyToOne(() => Booking, (booking) => booking.incidents, { nullable: true })
  booking: Booking;

  @Column()
  event_type: string;

  @Column()
  timestamp: Date;

  @Column('json')
  payload: any;
}
