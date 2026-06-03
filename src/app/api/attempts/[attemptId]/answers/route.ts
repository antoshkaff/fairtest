import type { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/server/api-response";
import { ERROR_CODES, AppError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { validateBody } from "@/lib/server/validate";
import { answerQuestionSchema } from "@/features/test-passing/answer-question/schema";

type Params = { params: Promise<{ attemptId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { attemptId } = await params;
    const input = validateBody(answerQuestionSchema, await req.json());

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

    const question = await prisma.question.findUnique({
      where: { id: input.questionId },
      include: { options: true },
    });
    if (!question || question.testId !== attempt.testId) {
      throw new AppError(ERROR_CODES.QUESTION_NOT_FOUND, "Питання не знайдено", 404);
    }

    if (question.type === "single_choice") {
      const option = question.options.find((item) => item.id === input.answerOptionId);
      if (!option) {
        throw new AppError(ERROR_CODES.INVALID_ANSWER, "Некоректна відповідь", 400);
      }
    }

    if (question.type === "open_text" && !input.answerText?.trim()) {
      throw new AppError(ERROR_CODES.INVALID_ANSWER, "Введіть відкриту відповідь", 400);
    }

    const answer = await prisma.studentAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId: input.questionId,
        },
      },
      update: {
        answerOptionId: question.type === "single_choice" ? input.answerOptionId : null,
        answerText: question.type === "open_text" ? input.answerText?.trim() : null,
      },
      create: {
        attemptId,
        questionId: input.questionId,
        answerOptionId: question.type === "single_choice" ? input.answerOptionId : null,
        answerText: question.type === "open_text" ? input.answerText?.trim() : null,
      },
    });

    return successResponse(answer);
  } catch (error) {
    return handleApiError(error);
  }
}
