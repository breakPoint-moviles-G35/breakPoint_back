/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HostProfile } from './entities/host-profile.entity/host-profile.entity';

@Injectable()
export class HostProfileService {
    constructor(
        @InjectRepository(HostProfile)
        private readonly hostProfileRepository: Repository<HostProfile>,
    ) {}

    async findAll(): Promise<HostProfile[]> {
        return this.hostProfileRepository.find({
            relations: ['user', 'spaces'],
        });
    }

    async findOne(id: string): Promise<HostProfile> {
        const hostProfile = await this.hostProfileRepository.findOne({
            where: { id },
            relations: ['user', 'spaces'],
        });

        if (!hostProfile) {
            throw new NotFoundException(`Host profile with id ${id} not found`);
        }

        return hostProfile;
    }

    async findByUserId(userId: string): Promise<HostProfile[]> {
        return this.hostProfileRepository.find({
            where: { user: { id: userId } },
            relations: ['user', 'spaces'],
        });
    }

    async create(hostProfileData: Partial<HostProfile>): Promise<HostProfile> {
        const hostProfile = this.hostProfileRepository.create(hostProfileData);
        return this.hostProfileRepository.save(hostProfile);
    }

    async update(id: string, hostProfileData: Partial<HostProfile>): Promise<HostProfile> {
        const hostProfile = await this.findOne(id);
        Object.assign(hostProfile, hostProfileData);
        return this.hostProfileRepository.save(hostProfile);
    }

    async remove(id: string): Promise<void> {
        const hostProfile = await this.findOne(id);
        await this.hostProfileRepository.remove(hostProfile);
    }
}
