import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HostProfile } from './entities/host-profile.entity/host-profile.entity';
import { CreateHostProfileDto, UpdateHostProfileDto } from './dto/create-host-profile.dto';

@Injectable()
export class HostProfileService {
  constructor(
    @InjectRepository(HostProfile)
    private readonly hostProfileRepository: Repository<HostProfile>,
  ) {}

  async create(createHostProfileDto: CreateHostProfileDto): Promise<HostProfile> {
    const hostProfile = this.hostProfileRepository.create(createHostProfileDto);
    return await this.hostProfileRepository.save(hostProfile);
  }

  async findAll(): Promise<HostProfile[]> {
    return await this.hostProfileRepository.find({
      relations: ['user', 'spaces','spaces.reviews'],
    });
  }

  async findOne(id: string): Promise<HostProfile> {
    const hostProfile = await this.hostProfileRepository.findOne({
      where: { id },
      relations: ['user', 'spaces'],
    });

    if (!hostProfile) {
      throw new NotFoundException(`HostProfile with ID ${id} not found`);
    }

    return hostProfile;
  }

  async findByUserId(userId: string): Promise<HostProfile> {
    const hostProfile = await this.hostProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'spaces'],
    });

    if (!hostProfile) {
      throw new NotFoundException(`HostProfile for user ${userId} not found`);
    }

    return hostProfile;
  }

  async update(id: string, updateHostProfileDto: UpdateHostProfileDto): Promise<HostProfile> {
    const hostProfile = await this.findOne(id);
    
    Object.assign(hostProfile, updateHostProfileDto);
    return await this.hostProfileRepository.save(hostProfile);
  }

  async remove(id: string): Promise<void> {
    const hostProfile = await this.findOne(id);
    await this.hostProfileRepository.remove(hostProfile);
  }
}
