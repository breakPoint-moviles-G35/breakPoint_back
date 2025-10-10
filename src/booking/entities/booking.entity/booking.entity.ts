
import { AccessCredentialEntity } from 'src/access-credential/entities/access-credential.entity/access-credential.entity';
import { IncidentEntity } from 'src/incident/entities/incident.entity/incident.entity';
import { Review } from 'src/review/entities/review.entity';
import { Space } from 'src/space/entities/space.entity/space.entity';
import { User } from 'src/user/entities/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';


export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  CLOSED = 'CLOSED',
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.bookings)
  user: User;

  @ManyToOne(() => Space, (space) => space.bookings)
  space: Space;

  @Column()
  slot_start: Date;

  @Column()
  slot_end: Date;

  @Column({ type: 'enum', enum: BookingStatus })
  status: BookingStatus;

  @OneToOne(() => AccessCredentialEntity, { nullable: true })
  @JoinColumn()
  accessCredential: AccessCredentialEntity;


  @OneToOne(() => Review, (review) => review.booking)
  review: Review;

  @OneToMany(() => IncidentEntity, (incident) => incident.booking)
  incidents: IncidentEntity[];

  @Column('decimal')
  total_amount: number;

  @Column()
  currency: string;
}
