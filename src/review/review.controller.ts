import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Logger,
  
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import type { Request } from 'express';

@Controller('review')
export class ReviewController {
  private readonly logger = new Logger(ReviewController.name);

  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async create(@Req() req: Request, @Body() createReviewDto: CreateReviewDto) {
    this.logger.log(`HTTP POST /review | user=${(req as any)?.user?.id}`);
    const userId = (req as any).user?.id;
    return this.reviewService.create(userId, createReviewDto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    this.logger.log(`HTTP GET /review | user=${(req as any)?.user?.id}`);
    return this.reviewService.findAll();
  }

  @Get('my-reviews')
  async findMyReviews(@Req() req: Request) {
    this.logger.log(`HTTP GET /review/my-reviews | user=${(req as any)?.user?.id}`);
    const userId = (req as any).user?.id;
    return this.reviewService.findByUserId(userId);
  }

  @Get('space/:spaceId')
  async findBySpaceId(@Req() req: Request, @Param('spaceId') spaceId: string) {
    this.logger.log(`HTTP GET /review/space/${spaceId} | user=${(req as any)?.user?.id}`);
    return this.reviewService.findBySpaceId(spaceId);
  }

  @Get('space/:spaceId/stats')
  async getSpaceStats(@Req() req: Request, @Param('spaceId') spaceId: string) {
    this.logger.log(`HTTP GET /review/space/${spaceId}/stats | user=${(req as any)?.user?.id}`);
    const [averageRating, reviewCount] = await Promise.all([
      this.reviewService.getAverageRatingBySpaceId(spaceId),
      this.reviewService.getReviewCountBySpaceId(spaceId),
    ]);

    return {
      space_id: spaceId,
      average_rating: averageRating,
      review_count: reviewCount,
    };
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    this.logger.log(`HTTP GET /review/${id} | user=${(req as any)?.user?.id}`);
    return this.reviewService.findOne(id);
  }
}
