
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from './entities/space.entity/space.entity';
import { BookingStatus } from 'src/booking/entities/booking.entity/booking.entity';

@Injectable()
export class SpaceService {
    constructor(
        @InjectRepository(Space)
        private readonly spaceRepository: Repository<Space>
    ) {}

    async findAll() : Promise<Space[]> {
        return this.spaceRepository.find();
    }
    async findAllSortedByPrice() : Promise<Space[]> {
        return this.spaceRepository.find({
            order: {
                price: 'ASC',
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

    async findOne(id: string): Promise<Space> {
  const space = await this.spaceRepository.findOne({
      where: { id },
      relations: ['bookings', 'slots', 'hostProfile'], 
    });

    if (!space) {
      throw new NotFoundException(`Space with id ${id} not found`);
    }

    return space;
  }

  async findNearestAvailableByLocation(latitude: number, longitude: number): Promise<Space | null> {
  const now = new Date();
  const start = new Date(now.getTime() + 20 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const blockingStatuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED];

  const spaces = await this.spaceRepository
    .createQueryBuilder('space')
    .leftJoin(
      'space.bookings',
      'booking',
      'booking.status IN (:...statuses) AND booking.slot_start < :end AND booking.slot_end > :start',
    )
    .where('space.geo IS NOT NULL')
    .andWhere('space.geo <> :empty', { empty: '' })
    .andWhere('booking.id IS NULL')
    .setParameters({
      statuses: blockingStatuses,
      start,
      end,
    })
    .getMany();

  if (!spaces.length) {
    return null;
  }

  const parseGeo = (geo: string): { lat: number; lng: number } | null => {
    const parts = geo.split(',').map((p) => p.trim());
    if (parts.length !== 2) {
      return null;
    }
    const lat = Number(parts[0]);
    const lng = Number(parts[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return null;
    }
    return { lat, lng };
  };

  const toRad = (value: number): number => (value * Math.PI) / 180;
  const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  let nearest: { space: Space; distanceKm: number } | null = null;
  for (const space of spaces) {
    const coords = space.geo ? parseGeo(space.geo) : null;
    if (!coords) {
      continue;
    }
    const distanceKm = haversineKm(latitude, longitude, coords.lat, coords.lng);
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = { space, distanceKm };
    }
  }

  return nearest ? nearest.space : null;
}

  

}
