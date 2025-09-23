/* eslint-disable prettier/prettier */
import { Booking } from 'src/booking/entities/booking.entity/booking.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Booking, (booking) => booking.review)
  @JoinColumn()
  booking: Booking;

  @Column('int')
  rating: number;

  @Column('text')
  text: string;

  @Column('int', { default: 0 })
  flags: number;
}
