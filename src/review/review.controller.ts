/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewEntity } from './entities/review.entity/review.entity';

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Get()
    async findAll() {
        return this.reviewService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.reviewService.findOne(id);
    }

    @Get('space/:spaceId')
    async findBySpaceId(@Param('spaceId') spaceId: string) {
        return this.reviewService.findBySpaceId(spaceId);
    }

    @Post()
    async create(@Body() reviewData: Partial<ReviewEntity>) {
        return this.reviewService.create(reviewData);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() reviewData: Partial<ReviewEntity>) {
        return this.reviewService.update(id, reviewData);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.reviewService.remove(id);
        return { message: 'Review deleted successfully' };
    }
}
