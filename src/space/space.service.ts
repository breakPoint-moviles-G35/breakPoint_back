/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from './entities/space.entity/space.entity';

@Injectable()
export class SpaceService {
    constructor(
        @InjectRepository(Space)
        private readonly spaceRepository: Repository<Space>,
    ) {}

    async findAll() : Promise<Space[]> {
        return this.spaceRepository.find();
    }
    async findAllSortedByPrice() : Promise<Space[]> {
        return this.spaceRepository.find({
            order: {
                base_price_per_30m: 'ASC',
            },
        });
    }

    async findSpacesByAvailability(start: Date, end: Date): Promise<Space[]> {
  const spaces = await this.spaceRepository
    .createQueryBuilder('space')
    .leftJoinAndSelect('space.bookings', 'booking')
    .where(
      `booking.id IS NULL 
       OR NOT (booking.slot_start < :end AND booking.slot_end > :start)`,
      { start, end },
    )
    .getMany();

  return spaces;
}

}
