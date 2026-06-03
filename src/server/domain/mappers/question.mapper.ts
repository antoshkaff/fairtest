import type {
  AnswerOption as PrismaAnswerOption,
  Question as PrismaQuestion,
} from "@prisma/client";
import { Question } from "../entities/question.entity";
import { mapPrismaAnswerOptionToEntity } from "./answer-option.mapper";

export type PrismaQuestionWithOptions = PrismaQuestion & {
  options?: PrismaAnswerOption[];
};

export function mapPrismaQuestionToEntity(question: PrismaQuestionWithOptions): Question {
  return new Question({
    id: question.id,
    testId: question.testId,
    text: question.text,
    type: question.type,
    points: question.points,
    answerOptions: question.options?.map(mapPrismaAnswerOptionToEntity) ?? [],
  });
}
