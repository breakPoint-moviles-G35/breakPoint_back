import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqQuestion } from './faq-question.entity';
import { FaqAnswer } from './faq-answer.entity';
import { CreateFaqQuestionDto, CreateFaqAnswerDto } from './dto/create-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(FaqQuestion)
    private questionRepo: Repository<FaqQuestion>,

    @InjectRepository(FaqAnswer)
    private answerRepo: Repository<FaqAnswer>,
  ) {}

  // Crear Pregunta
  async createQuestion(authorId: string, dto: CreateFaqQuestionDto) {
    const q = this.questionRepo.create({
      title: dto.title,
      question: dto.question, // <-- CAMPO REAL
      authorId: authorId,
    });

    return await this.questionRepo.save(q);
  }

  // Crear Respuesta
  async createAnswer(authorId: string, dto: CreateFaqAnswerDto) {
    const exists = await this.questionRepo.findOne({
      where: { id: dto.question_id },
    });

    if (!exists) throw new NotFoundException('Question not found');

    const answer = this.answerRepo.create({
      text: dto.text,                 // <-- AQUÍ ESTABA EL PROBLEMA
      questionId: dto.question_id,    // <-- NOMBRE REAL
      authorId: authorId,
    });

    return await this.answerRepo.save(answer);
  }

  // Listar preguntas
  findAllQuestions() {
    return this.questionRepo.find({
      relations: ['author'],
    });
  }

  // Pregunta + respuestas
  findFullThread(id: string) {
    return this.questionRepo.findOne({
      where: { id },
      relations: ['author', 'answers', 'answers.author'],
    });
  }
}
