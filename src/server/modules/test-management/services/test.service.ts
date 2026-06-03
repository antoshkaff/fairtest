import { ERROR_CODES, AppError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";

type TestQuestionInput =
  | {
      text: string;
      type: "single_choice";
      points: number;
      options: { text: string; isCorrect: boolean }[];
    }
  | {
      text: string;
      type: "open_text";
      points: number;
      options: unknown[];
    };

type TestInput = {
  title: string;
  description?: string;
  status: "draft" | "published";
  showScore: boolean;
  timeLimitMinutes?: number;
  questions: TestQuestionInput[];
};

export class TestService {
  async listTeacherTests(teacherId: string) {
    const tests = await prisma.test.findMany({
      where: { teacherId },
      include: {
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      items: tests.map((test) => ({
        id: test.id,
        title: test.title,
        description: test.description,
        status: test.status,
        createdAt: test.createdAt,
        updatedAt: test.updatedAt,
        questionsCount: test._count.questions,
        attemptsCount: test._count.attempts,
      })),
    };
  }

  async createTest(teacherId: string, input: TestInput) {
    return prisma.test.create({
      data: {
        teacherId,
        title: input.title,
        description: input.description,
        status: input.status,
        showScore: input.showScore,
        timeLimitMinutes: input.timeLimitMinutes,
        questions: {
          create: this.mapQuestions(input.questions),
        },
      },
      include: { questions: { include: { options: true } } },
    });
  }

  async getTeacherTest(teacherId: string, testId: string) {
    return this.getOwnedTest(teacherId, testId);
  }

  async updateTest(teacherId: string, testId: string, input: TestInput) {
    await this.getOwnedTest(teacherId, testId);
    await prisma.question.deleteMany({ where: { testId } });

    return prisma.test.update({
      where: { id: testId },
      data: {
        title: input.title,
        description: input.description,
        status: input.status,
        showScore: input.showScore,
        timeLimitMinutes: input.timeLimitMinutes,
        questions: {
          create: this.mapQuestions(input.questions),
        },
      },
      include: { questions: { include: { options: true } } },
    });
  }

  async publishTest(teacherId: string, testId: string, status: unknown) {
    await this.getOwnedTest(teacherId, testId);

    if (status !== "published") {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Некоректний статус", 422);
    }

    return prisma.test.update({
      where: { id: testId },
      data: { status: "published" },
      select: { id: true, status: true },
    });
  }

  async deleteTest(teacherId: string, testId: string) {
    await this.getOwnedTest(teacherId, testId);
    await prisma.test.delete({ where: { id: testId } });
    return { deleted: true };
  }

  async getPublicTest(testId: string) {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            options: {
              select: { id: true, text: true },
            },
          },
        },
      },
    });

    if (!test) {
      throw new AppError(ERROR_CODES.TEST_NOT_FOUND, "Тест не знайдено", 404);
    }

    if (test.status !== "published") {
      throw new AppError(ERROR_CODES.TEST_NOT_PUBLISHED, "Тест не опубліковано", 400);
    }

    return {
      id: test.id,
      title: test.title,
      description: test.description,
      timeLimitMinutes: test.timeLimitMinutes,
      questions: test.questions,
    };
  }

  private async getOwnedTest(teacherId: string, testId: string) {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: { include: { options: true }, orderBy: { order: "asc" } } },
    });

    if (!test) {
      throw new AppError(ERROR_CODES.TEST_NOT_FOUND, "Тест не знайдено", 404);
    }

    if (test.teacherId !== teacherId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Немає доступу до ресурсу", 403);
    }

    return test;
  }

  private mapQuestions(questions: TestInput["questions"]) {
    return questions.map((question, index) => ({
      text: question.text,
      type: question.type,
      points: question.points,
      order: index + 1,
      options: {
        create:
          question.type === "single_choice"
            ? question.options.map((option) => ({
                text: option.text,
                isCorrect: option.isCorrect,
              }))
            : [],
      },
    }));
  }
}

export const testService = new TestService();
