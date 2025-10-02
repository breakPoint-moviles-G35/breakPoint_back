import { Module } from '@nestjs/common';
import { ReviewEntity } from './entities/review.entity/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([ReviewEntity])],
})
export class ReviewModule {}
