/* eslint-disable prettier/prettier */
import { Space } from 'src/space/entities/space.entity/space.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


export enum SlotStatus {
  OPEN = 'OPEN',
  HOLD = 'HOLD',
  BOOKED = 'BOOKED',
  BLOCKED = 'BLOCKED',
}

@Entity()
export class InventorySlotEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Space, (space) => space.slots)
  space: Space;

  @Column({ type: 'enum', enum: SlotStatus })
  status: SlotStatus;

  @Column('decimal')
  price: number;
}
