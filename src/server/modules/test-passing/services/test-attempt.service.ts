import { ERROR_CODES, AppError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { mapPrismaBehaviorEventToEntity } from "@/server/domain/mappers/behavior-event.mapper";
import { mapPrismaQuestionToEntity } from "@/server/domain/mappers/question.mapper";
import { mapPrismaStudentAnswerToEntity } from "@/server/domain/mappers/student-answer.mapper";
import { mapPrismaTestAttemptToEntity } from "@/server/domain/mappers/test-attempt.mapper";
import { resultEvaluator } from "./result-evaluator.service";
import { riskScoreCalculator } from "./risk-score-calculator.service";
import { timelineBuilder } from "./timeline-builder.service";

type StartAttemptInput = {
  testId: string;
  participantFirstName: string;
  participantLastName: string;
};

type SaveAnswerInput = {
  questionId: string;
  answerOptionId?: string;
  answerText?: string;
};

type BehaviorEventInput = {
  eventType:
    | "window_blur"
    | "window_focus"
    | "tab_hidden"
    | "tab_visible"
    | "copy"
    | "paste"
    | "suspicious_pause";
  eventTime: string;
  duration?: number;
  details?: string;
};

type BehaviorEventsBatchInput = {
  events: BehaviorEventInput[];
};

export class TestAttemptService {
  async createAttempt(testId: string, firstName: string, lastName: string) {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: { id: true, status: true },
    });

    if (!test) {
      throw new AppError(ERROR_CODES.TEST_NOT_FOUND, "Тест не знайдено", 404);
    }

    if (test.status !== "published") {
      throw new AppError(ERROR_CODES.TEST_NOT_PUBLISHED, "Тест не опубліковано", 400);
    }

    return prisma.testAttempt.create({
      data: {
        testId,
        participantFirstName: firstName,
        participantLastName: lastName,
      },
    });
  }

  createAttemptFromInput(input: StartAttemptInput) {
    return this.createAttempt(input.testId, input.participantFirstName, input.participantLastName);
  }

  async saveAnswer(attemptId: string, answerData: SaveAnswerInput) {
    const attempt = await this.getActiveAttempt(attemptId);
    const question = await prisma.question.findUnique({
      where: { id: answerData.questionId },
      include: { options: true },
    });

    if (!question || question.testId !== attempt.testId) {
      throw new AppError(ERROR_CODES.QUESTION_NOT_FOUND, "Питання не знайдено", 404);
    }

    if (question.type === "single_choice") {
      const option = question.options.find((item) => item.id === answerData.answerOptionId);
      if (!option) {
        throw new AppError(ERROR_CODES.INVALID_ANSWER, "Некоректна відповідь", 400);
      }
    }

    if (question.type === "open_text" && !answerData.answerText?.trim()) {
      throw new AppError(ERROR_CODES.INVALID_ANSWER, "Введіть відкриту відповідь", 400);
    }

    return prisma.studentAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId: answerData.questionId,
        },
      },
      update: {
        answerOptionId: question.type === "single_choice" ? answerData.answerOptionId : null,
        answerText: question.type === "open_text" ? answerData.answerText?.trim() : null,
      },
      create: {
        attemptId,
        questionId: answerData.questionId,
        answerOptionId: question.type === "single_choice" ? answerData.answerOptionId : null,
        answerText: question.type === "open_text" ? answerData.answerText?.trim() : null,
      },
    });
  }

  async trackEvent(attemptId: string, eventData: BehaviorEventInput | BehaviorEventsBatchInput) {
    const events = "events" in eventData ? eventData.events : [eventData];
    await this.assertAttemptExists(attemptId);

    if (events.length === 0) {
      return { count: 0 };
    }

    const result = await prisma.behaviorEvent.createMany({
      data: events.map((event) => ({
        attemptId,
        eventType: event.eventType,
        eventTime: new Date(event.eventTime),
        duration: event.duration,
        details: event.details,
      })),
    });

    return { count: result.count };
  }

  async finishAttempt(attemptId: string) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
        answers: {
          include: { answerOption: true, question: true },
        },
        behaviorEvents: true,
      },
    });

    if (!attempt) {
      throw new AppError(ERROR_CODES.ATTEMPT_NOT_FOUND, "Спробу тестування не знайдено", 404);
    }

    if (attempt.status === "finished") {
      throw new AppError(
        ERROR_CODES.ATTEMPT_ALREADY_FINISHED,
        "Спроба тестування вже завершена",
        409,
      );
    }

    const score = resultEvaluator.calculateAttemptScore(
      attempt.test.questions.map(mapPrismaQuestionToEntity),
      attempt.answers.map(mapPrismaStudentAnswerToEntity),
    );
    const riskScore = riskScoreCalculator.calculateRiskScore(
      attempt.behaviorEvents.map(mapPrismaBehaviorEventToEntity),
      attempt.test.questions.length,
    );

    return prisma.testAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "finished",
        finishedAt: new Date(),
        score,
        riskScore,
      },
      include: {
        test: { select: { id: true, title: true } },
      },
    });
  }

  async listTeacherResults(teacherId: string) {
    const attempts = await prisma.testAttempt.findMany({
      where: { test: { teacherId } },
      include: {
        test: { select: { id: true, title: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    return { items: attempts };
  }

  async getTeacherAttemptAnalytics(teacherId: string, attemptId: string) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: { include: { questions: { include: { options: true }, orderBy: { order: "asc" } } } },
        answers: { include: { answerOption: true, question: true } },
        behaviorEvents: true,
      },
    });

    if (!attempt) {
      throw new AppError(ERROR_CODES.ATTEMPT_NOT_FOUND, "Спробу тестування не знайдено", 404);
    }

    if (attempt.test.teacherId !== teacherId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Немає доступу до ресурсу", 403);
    }

    const domainAttempt = mapPrismaTestAttemptToEntity(attempt);

    return {
      ...attempt,
      behaviorEvents: timelineBuilder.buildTimeline(domainAttempt.events),
    };
  }

  private async getActiveAttempt(attemptId: string) {
    const attempt = await prisma.testAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt) {
      throw new AppError(ERROR_CODES.ATTEMPT_NOT_FOUND, "Спробу тестування не знайдено", 404);
    }
    if (attempt.status === "finished") {
      throw new AppError(
        ERROR_CODES.ATTEMPT_ALREADY_FINISHED,
        "Спроба тестування вже завершена",
        409,
      );
    }

    return attempt;
  }

  private async assertAttemptExists(attemptId: string) {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      select: { id: true },
    });

    if (!attempt) {
      throw new AppError(ERROR_CODES.ATTEMPT_NOT_FOUND, "Спробу тестування не знайдено", 404);
    }
  }
}

export const testAttemptService = new TestAttemptService();
