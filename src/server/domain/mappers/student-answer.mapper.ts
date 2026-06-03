import type {
  AnswerOption as PrismaAnswerOption,
  Question as PrismaQuestion,
  StudentAnswer as PrismaStudentAnswer,
} from "@prisma/client";
import { StudentAnswer } from "../entities/student-answer.entity";

export type PrismaStudentAnswerWithEvaluation = PrismaStudentAnswer & {
  answerOption?: PrismaAnswerOption | null;
  question?: PrismaQuestion | null;
};

export function mapPrismaStudentAnswerToEntity(
  answer: PrismaStudentAnswerWithEvaluation,
): StudentAnswer {
  const isCorrect = answer.answerOption?.isCorrect ?? false;

  return new StudentAnswer({
    id: answer.id,
    attemptId: answer.attemptId,
    questionId: answer.questionId,
    answerOptionId: answer.answerOptionId,
    textAnswer: answer.answerText,
    isCorrect,
    pointsEarned: isCorrect ? (answer.question?.points ?? 0) : 0,
  });
}
