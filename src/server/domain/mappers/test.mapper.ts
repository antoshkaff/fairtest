import type {
  AnswerOption as PrismaAnswerOption,
  Question as PrismaQuestion,
  Test as PrismaTest,
} from "@prisma/client";
import { Test } from "../entities/test.entity";
import { mapPrismaQuestionToEntity } from "./question.mapper";

export type PrismaTestWithQuestions = PrismaTest & {
  questions?: (PrismaQuestion & { options?: PrismaAnswerOption[] })[];
};

export function mapPrismaTestToEntity(test: PrismaTestWithQuestions): Test {
  return new Test({
    id: test.id,
    title: test.title,
    description: test.description,
    timeLimit: test.timeLimitMinutes,
    isPublished: test.status === "published",
    questions: test.questions?.map(mapPrismaQuestionToEntity) ?? [],
  });
}
