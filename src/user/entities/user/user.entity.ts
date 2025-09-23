/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { HostProfile } from 'src/host-profile/entities/host-profile.entity/host-profile.entity';
import { EventLog } from 'src/event-log/entities/event-log.entity/event-log.entity';
import { Booking } from 'src/booking/entities/booking.entity/booking.entity';

export enum UserRole {
  STUDENT = 'Student',
  HOST = 'Host',
  ADMIN = 'Admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column()
  auth_provider: string;

  @Column({ default: 'active' })
  status: string;

  @OneToMany(() => HostProfile, (hp) => hp.user)
  hostProfiles: HostProfile[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => EventLog, (event) => event.user)
  eventLogs: EventLog[];
}
