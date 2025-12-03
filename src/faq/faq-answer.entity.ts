import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user/user.entity';
import { FaqQuestion } from './faq-question.entity';

@Entity('faq_answer')
export class FaqAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @ManyToOne(() => FaqQuestion)
  @JoinColumn({ name: 'questionId' })
  question: FaqQuestion;

  @Column()
  questionId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: string;
}
