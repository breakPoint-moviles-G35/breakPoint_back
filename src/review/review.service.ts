import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    // Verificar si el usuario ya tiene una review para este espacio
    const existingReview = await this.reviewRepository.findOne({
      where: { 
        space_id: createReviewDto.space_id,
        user_id: userId 
      },
    });

    if (existingReview) {
      throw new ForbiddenException('User already has a review for this space');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      user_id: userId,
    });

    return await this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return await this.reviewRepository.find({
      relations: ['space', 'user'],
    });
  }

  async findBySpaceId(spaceId: string): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { space_id: spaceId },
      relations: ['space', 'user'],
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['space', 'user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async findByUserId(userId: string): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { user_id: userId },
      relations: ['space', 'user'],
    });
  }

  async update(id: string, userId: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);

    // Verificar que el usuario sea el autor de la review
    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    Object.assign(review, updateReviewDto);
    return await this.reviewRepository.save(review);
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.findOne(id);

    // Verificar que el usuario sea el autor de la review
    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);
  }

  async getAverageRatingBySpaceId(spaceId: string): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.space_id = :spaceId', { spaceId })
      .getRawOne();

    return parseFloat(result.average) || 0;
  }

  async getReviewCountBySpaceId(spaceId: string): Promise<number> {
    return await this.reviewRepository.count({
      where: { space_id: spaceId },
    });
  }
}
