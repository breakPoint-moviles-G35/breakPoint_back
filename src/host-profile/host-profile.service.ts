/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HostProfile } from './entities/host-profile.entity/host-profile.entity';
import { User } from 'src/user/entities/user/user.entity';
import { Space } from 'src/space/entities/space.entity/space.entity';

@Injectable()
export class HostProfileService {
  constructor(
    @InjectRepository(HostProfile)
    private readonly hostProfileRepository: Repository<HostProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
  ) {}

  async findOne(id: string): Promise<any> {
    const logger = new Logger(HostProfileService.name);
    logger.log(`Finding host profile with id: ${id}`);

    const hostProfile = await this.hostProfileRepository.findOne({
      where: { id },
      relations: ['user', 'spaces'],
    });

    if (!hostProfile) {
      throw new NotFoundException(`Host profile with id ${id} not found`);
    }

    // Calcular estadísticas adicionales
    const totalSpaces = hostProfile.spaces?.length || 0;
    const monthsHosting = this.calculateMonthsHosting(hostProfile.createdAt);

    // Formatear respuesta para el frontend
    return {
      id: hostProfile.id,
      name: hostProfile.user?.name || 'Host',
      avatarUrl: hostProfile.avatarUrl,
      verification_status: hostProfile.verification_status,
      payout_method: hostProfile.payout_method,
      location: hostProfile.location,
      work: hostProfile.work,
      born: hostProfile.born,
      rating_avg: hostProfile.rating_avg,
      total_reviews: hostProfile.total_reviews,
      total_bookings: hostProfile.total_bookings,
      total_spaces: totalSpaces,
      months_hosting: monthsHosting,
      createdAt: hostProfile.createdAt,
      updatedAt: hostProfile.updatedAt,
      user: {
        id: hostProfile.user?.id,
        name: hostProfile.user?.name,
        email: hostProfile.user?.email,
      },
      spaces: hostProfile.spaces?.map(space => ({
        id: space.id,
        title: space.title,
        subtitle: space.subtitle,
        price: space.price,
        capacity: space.capacity,
        rating_avg: space.rating_avg,
      })) || [],
    };
  }

  async findByUserId(userId: string): Promise<any> {
    const logger = new Logger(HostProfileService.name);
    logger.log(`Finding host profile for user: ${userId}`);

    const hostProfile = await this.hostProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'spaces'],
    });

    if (!hostProfile) {
      throw new NotFoundException(`Host profile for user ${userId} not found`);
    }

    return this.findOne(hostProfile.id);
  }

  async findAll(): Promise<HostProfile[]> {
    const logger = new Logger(HostProfileService.name);
    logger.log('Finding all host profiles');

    return this.hostProfileRepository.find({
      relations: ['user', 'spaces'],
    });
  }

  private calculateMonthsHosting(createdAt: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  }
}
