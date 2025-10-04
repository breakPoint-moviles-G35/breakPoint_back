/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './entities/review.entity/review.entity';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(ReviewEntity)
        private readonly reviewRepository: Repository<ReviewEntity>,
    ) {}

    async findAll(): Promise<ReviewEntity[]> {
        return this.reviewRepository.find({
            relations: ['booking'],
        });
    }

    async findOne(id: string): Promise<ReviewEntity> {
        const review = await this.reviewRepository.findOne({
            where: { id },
            relations: ['booking'],
        });

        if (!review) {
            throw new NotFoundException(`Review with id ${id} not found`);
        }

        return review;
    }

    async findBySpaceId(spaceId: string): Promise<ReviewEntity[]> {
        return this.reviewRepository
            .createQueryBuilder('review')
            .leftJoinAndSelect('review.booking', 'booking')
            .leftJoinAndSelect('booking.space', 'space')
            .where('space.id = :spaceId', { spaceId })
            .getMany();
    }

    async create(reviewData: Partial<ReviewEntity>): Promise<ReviewEntity> {
        const review = this.reviewRepository.create(reviewData);
        return this.reviewRepository.save(review);
    }

    async update(id: string, reviewData: Partial<ReviewEntity>): Promise<ReviewEntity> {
        const review = await this.findOne(id);
        Object.assign(review, reviewData);
        return this.reviewRepository.save(review);
    }

    async remove(id: string): Promise<void> {
        const review = await this.findOne(id);
        await this.reviewRepository.remove(review);
    }
}
