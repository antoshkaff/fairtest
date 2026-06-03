import type {
  AnswerOption as PrismaAnswerOption,
  BehaviorEvent as PrismaBehaviorEvent,
  Question as PrismaQuestion,
  StudentAnswer as PrismaStudentAnswer,
  TestAttempt as PrismaTestAttempt,
} from "@prisma/client";
import { TestAttempt } from "../entities/test-attempt.entity";
import { mapPrismaBehaviorEventToEntity } from "./behavior-event.mapper";
import { mapPrismaStudentAnswerToEntity } from "./student-answer.mapper";

export type PrismaTestAttemptWithRelations = PrismaTestAttempt & {
  answers?: (PrismaStudentAnswer & {
    answerOption?: PrismaAnswerOption | null;
    question?: PrismaQuestion | null;
  })[];
  behaviorEvents?: PrismaBehaviorEvent[];
};

export function mapPrismaTestAttemptToEntity(attempt: PrismaTestAttemptWithRelations): TestAttempt {
  return new TestAttempt({
    id: attempt.id,
    testId: attempt.testId,
    participantFirstName: attempt.participantFirstName,
    participantLastName: attempt.participantLastName,
    startedAt: attempt.startedAt,
    finishedAt: attempt.finishedAt,
    score: attempt.score,
    riskScore: attempt.riskScore,
    status: attempt.status,
    answers: attempt.answers?.map(mapPrismaStudentAnswerToEntity) ?? [],
    events: attempt.behaviorEvents?.map(mapPrismaBehaviorEventToEntity) ?? [],
  });
}
