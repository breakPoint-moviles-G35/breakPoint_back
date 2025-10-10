import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Space } from 'src/space/entities/space.entity/space.entity';
import { User } from 'src/user/entities/user/user.entity';
import { Booking } from 'src/booking/entities/booking.entity/booking.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  space_id: string;

  @Column()
  user_id: string;

  @Column()
  rating: number;

  @Column('text')
  text: string;

  @Column()
  flags: number;

  @ManyToOne(() => Space, (space) => space.reviews)
  @JoinColumn({ name: 'space_id' })
  space: Space;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Booking, (booking) => booking.review)
  booking: Booking;
}
