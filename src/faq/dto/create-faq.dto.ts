import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFaqQuestionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  question: string;
}

export class CreateFaqAnswerDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsUUID()
  @IsNotEmpty()
  question_id: string;
}
