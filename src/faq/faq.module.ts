import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqQuestion } from './faq-question.entity';
import { FaqAnswer } from './faq-answer.entity';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FaqQuestion, FaqAnswer])],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}
