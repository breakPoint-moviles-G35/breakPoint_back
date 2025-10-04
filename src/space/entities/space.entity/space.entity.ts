import { Booking} from 'src/booking/entities/booking.entity/booking.entity';
import { HostProfile } from 'src/host-profile/entities/host-profile.entity/host-profile.entity';

import { InventorySlotEntity } from 'src/inventory-slot/entities/inventory-slot.entity/inventory-slot.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';


@Entity()
export class Space {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => HostProfile, (hp) => hp.spaces)
  hostProfile: HostProfile;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle?: string;


  @Column({ nullable : true})
  geo: string;

  @Column()
  capacity: number;

  @Column({ nullable: true })
  imageUrl:string;

  @Column('simple-array')
  amenities: string[];

  @Column('simple-array', { nullable: true })
  accessibility: string[];

  @Column()
  rules: string;

  @Column('decimal')
  price: number;

  @Column({ type: 'float', default: 0 })
  rating_avg: number;

  @OneToMany(() => InventorySlotEntity, (slot) => slot.space)
  slots: InventorySlotEntity[];

  @OneToMany(() => Booking, (booking) => booking.space)
  bookings: Booking[];
}


