/* eslint-disable prettier/prettier */
import { Space } from 'src/space/entities/space.entity/space.entity';
import { User } from 'src/user/entities/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';


@Entity()
export class HostProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  verification_status: string;

  @Column()
  payout_method: string;

  @ManyToOne(() => User, (user) => user.hostProfiles)
  user: User;

  @OneToMany(() => Space, (space) => space.hostProfile)
  spaces: Space[];
}
