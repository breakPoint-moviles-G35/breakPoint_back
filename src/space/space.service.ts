import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from './entities/space.entity/space.entity';
import { ReviewService } from '../review/review.service';
import { HostProfileService } from '../host-profile/host-profile.service';
import { SpaceDetailDto, SpaceDto, HostSummaryDto, ReviewDto } from './dto/space-detail.dto';

@Injectable()
export class SpaceService {
    constructor(
        @InjectRepository(Space)
        private readonly spaceRepository: Repository<Space>,
        private readonly reviewService: ReviewService,
        private readonly hostProfileService: HostProfileService,
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
      relations: ['bookings', 'slots', 'hostProfile'], // ajustar segun necesidad (mas adelante)
    });

    if (!space) {
      throw new NotFoundException(`Space with id ${id} not found`);
    }

    return space;
  }

  async findOneWithDetails(id: string): Promise<SpaceDetailDto> {
    const space = await this.findOne(id);
    
    // Obtener reviews del espacio
    const reviews = await this.reviewService.findBySpaceId(id);
    
    // Calcular rating promedio solo si hay reviews
    const hasReviews = reviews.length > 0;
    const averageRating = hasReviews 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : undefined;
  
    // Obtener información del host
    let hostSummary: HostSummaryDto | undefined;
    if (space.hostProfile) {
      const hostProfile = await this.hostProfileService.findOne(space.hostProfile.id);
      
      // Calcular rating del host basado en reviews del espacio actual
      const hostHasReviews = reviews.length > 0;
      const hostAverageRating = hostHasReviews 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : undefined;
  
      hostSummary = {
        id: hostProfile.id,
        name: hostProfile.user?.name || 'Host',
        avatarUrl: 'https://example.com/avatar.jpg',
        rating: hostAverageRating, // Solo si hay reviews
        isSuperhost: false,
        reviewsCount: reviews.length, // Número real de reviews
        monthsHosting: 12,
        born: 'Born in the 2000s',
        location: 'Torres Blancas, Colombia',
        work: 'Estudiante',
      };
    }
  
    // Mapear reviews a DTO
    const reviewDtos: ReviewDto[] = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.text,
      authorName: 'Usuario', // Esto se puede obtener del booking.user
      createdAt: new Date().toISOString(), // Esto se puede obtener del booking
    }));
  
    // Mapear espacio a DTO
    const spaceDto: SpaceDto = {
      id: space.id,
      title: space.title,
      subtitle: space.subtitle,
      geo: space.geo,
      capacity: space.capacity,
      amenities: space.amenities,
      accessibility: space.accessibility,
      rules: space.rules,
      price: space.price,
      rating_avg: averageRating, // Solo si hay reviews, sino undefined
      imageUrl: undefined, // Se puede agregar campo de imagen
    };
  
    return {
      space: spaceDto,
      host: hostSummary,
      reviews: reviewDtos,
    };
  }

}
