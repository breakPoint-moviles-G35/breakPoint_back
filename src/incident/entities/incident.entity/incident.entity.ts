
import { Booking } from 'src/booking/entities/booking.entity/booking.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

export enum IncidentCategory {
  ACCESS_FAIL = 'ACCESS_FAIL',
  NO_SHOW = 'NO_SHOW',
  SAFETY = 'SAFETY',
}

@Entity()
export class IncidentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Booking, (booking) => booking.incidents)
  booking: Booking;

  @Column({ type: 'enum', enum: IncidentCategory })
  category: IncidentCategory;

  @Column()
  SLA_state: string;
}
