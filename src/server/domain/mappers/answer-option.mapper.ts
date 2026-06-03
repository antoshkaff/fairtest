import type { AnswerOption as PrismaAnswerOption } from "@prisma/client";
import { AnswerOption } from "../entities/answer-option.entity";

export function mapPrismaAnswerOptionToEntity(option: PrismaAnswerOption): AnswerOption {
  return new AnswerOption({
    id: option.id,
    questionId: option.questionId,
    text: option.text,
    isCorrect: option.isCorrect,
  });
}
