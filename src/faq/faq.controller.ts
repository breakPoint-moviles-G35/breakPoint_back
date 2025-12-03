import { Controller, Post, Body, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FaqService } from './faq.service';
import { CreateFaqQuestionDto, CreateFaqAnswerDto } from './dto/create-faq.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Post('question')
  @UseGuards(AuthGuard('jwt'))
  createQuestion(@Req() req, @Body() dto: CreateFaqQuestionDto) {
    return this.faqService.createQuestion(req.user.id, dto);
  }

  @Post('answer')
  @UseGuards(AuthGuard('jwt'))
  createAnswer(@Req() req, @Body() dto: CreateFaqAnswerDto) {
    return this.faqService.createAnswer(req.user.id, dto);
  }

  @Get('question')
  findAllQuestions() {
    return this.faqService.findAllQuestions();
  }

  @Get('question/:id')
  findThread(@Param('id') id: string) {
    return this.faqService.findFullThread(id);
  }
}
