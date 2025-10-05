
import { Space } from 'src/space/entities/space.entity/space.entity';
import { User } from 'src/user/entities/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class HostProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  verification_status: string;

  @Column()
  payout_method: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  work?: string;

  @Column({ nullable: true })
  born?: string;

  @Column({ type: 'float', default: 0 })
  rating_avg: number;

  @Column({ default: 0 })
  total_reviews: number;

  @Column({ default: 0 })
  total_bookings: number;

  @ManyToOne(() => User, (user) => user.hostProfiles)
  user: User;

  @OneToMany(() => Space, (space) => space.hostProfile)
  spaces: Space[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
