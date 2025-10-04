import { Module } from '@nestjs/common';
import { ReviewEntity } from './entities/review.entity/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ReviewEntity])],
    controllers: [ReviewController],
    providers: [ReviewService],
    exports: [ReviewService],
})
export class ReviewModule {}
