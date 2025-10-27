
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from './entities/space.entity/space.entity';
import { BookingStatus, Booking } from 'src/booking/entities/booking.entity/booking.entity';

@Injectable()
export class SpaceService {
    constructor(
        @InjectRepository(Space)
        private readonly spaceRepository: Repository<Space>,
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>
    ) {}

  async findAll(): Promise<Space[]> {
    return this.spaceRepository.find();
  }

  async findAllSortedByPrice(): Promise<Space[]> {
    return this.spaceRepository.find({
      order: { price: 'ASC' },
    });
  }

  async findSpacesByAvailability(start: Date, end: Date): Promise<Space[]> {
    return this.spaceRepository
      .createQueryBuilder('space')
      .leftJoinAndSelect('space.bookings', 'booking')
      .where(
        `booking.id IS NULL 
         OR NOT (booking.slot_start < :end AND booking.slot_end > :start)`,
        { start, end },
      )
      .getMany();
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
    const { start, end } = this.getDefaultAvailabilityWindow();
    const spaces = await this.fetchAvailableSpaces(start, end);
    const ranked = this.rankSpacesByDistance(spaces, latitude, longitude);
    return ranked.length ? ranked[0].space : null;
  }

  async findNearestAvailableSpaces(
    latitude: number,
    longitude: number,
    limit = 5,
  ): Promise<Space[]> {
    const { start, end } = this.getDefaultAvailabilityWindow();
    const spaces = await this.fetchAvailableSpaces(start, end);
    const ranked = this.rankSpacesByDistance(spaces, latitude, longitude);

    if (!ranked.length) {
      return [];
    }

    const safeLimit = Math.max(1, Math.floor(limit));
    return ranked.slice(0, safeLimit).map((entry) => entry.space);
  }

  private getDefaultAvailabilityWindow(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now.getTime() + 20 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { start, end };
  }

  private async fetchAvailableSpaces(start: Date, end: Date): Promise<Space[]> {
    const blockingStatuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED];

    return this.spaceRepository
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
  }

  private rankSpacesByDistance(
    spaces: Space[],
    latitude: number,
    longitude: number,
  ): { space: Space; distanceKm: number }[] {
    const ranked: { space: Space; distanceKm: number }[] = [];

    for (const space of spaces) {
      const coords = space.geo ? this.parseGeo(space.geo) : null;
      if (!coords) {
        continue;
      }

      const distanceKm = this.haversineKm(
        latitude,
        longitude,
        coords.lat,
        coords.lng,
      );

      ranked.push({ space, distanceKm });
    }

    return ranked.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  private parseGeo(geo: string): { lat: number; lng: number } | null {
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
  }

  private haversineKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRad = (value: number): number => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }



  async findSpacesByUserHistory(userId: string): Promise<Space[]> {
    // Obtener las últimas 3 reservas del usuario
    const recentBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.space', 'space')
      .where('booking.user.id = :userId', { userId })
      .orderBy('booking.slot_start', 'DESC')
      .limit(3)
      .getMany();
    if (recentBookings.length === 0) {
      // Si no tiene reservas previas, devolver vacio
      return [];
    }

    // Extraer todas las amenities de los espacios reservados
    const historicalAmenities = new Set<string>();
    recentBookings.forEach(booking => {
      if (booking.space && booking.space.amenities) {
        booking.space.amenities.forEach(amenity => {
          historicalAmenities.add(amenity);
        });
      }
    });

    // Convertir Set a Array para la consulta
    const amenitiesArray = Array.from(historicalAmenities);

    if (amenitiesArray.length === 0) {
      // Si no hay amenities, devolver todos los espacios
      return [];
    }

    // Obtener IDs de espacios ya reservados para excluirlos
    const reservedSpaceIds = recentBookings
      .map(booking => booking.space?.id)
      .filter(id => id !== undefined);
    
    // Buscar todos los espacios y calcular coincidencias de amenities
    const allSpaces = await this.spaceRepository.find();
    
    // Calcular espacios con coincidencias de amenities, excluyendo los ya reservados
    const spacesWithMatches = allSpaces
      .filter(space => !reservedSpaceIds.includes(space.id)) // Excluir espacios ya reservados
      .map(space => {
        if (!space.amenities || space.amenities.length === 0) {
          return { space, matches: 0 };
        }
        
        // Contar cuántas amenities del espacio coinciden con las históricas
        const matches = space.amenities.filter(amenity => 
          historicalAmenities.has(amenity)
        ).length;
        
        return { space, matches };
      })
      .filter(item => item.matches > 0) // Solo espacios con al menos una coincidencia
      .sort((a, b) => {
        // Ordenar por número de coincidencias (descendente), luego por rating (descendente), luego por precio (ascendente)
        if (b.matches !== a.matches) {
          return b.matches - a.matches;
        }
        if (b.space.rating_avg !== a.space.rating_avg) {
          return b.space.rating_avg - a.space.rating_avg;
        }
        return a.space.price - b.space.price;
      })
      .slice(0, 2) // Tomar solo las 2 mejores recomendaciones
      .map(item => item.space); // Extraer solo los espacios
      console.log(spacesWithMatches)
    return spacesWithMatches;
  }

}
