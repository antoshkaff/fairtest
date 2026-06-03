import type { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/server/api-response";
import { requireTeacher } from "@/lib/server/auth";
import { ERROR_CODES, AppError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";

type Params = { params: Promise<{ attemptId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const teacher = await requireTeacher(req);
    const { attemptId } = await params;
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: { include: { questions: { include: { options: true }, orderBy: { order: "asc" } } } },
        answers: { include: { answerOption: true } },
        behaviorEvents: { orderBy: { eventTime: "asc" } },
      },
    });

    if (!attempt) {
      throw new AppError(ERROR_CODES.ATTEMPT_NOT_FOUND, "Спробу тестування не знайдено", 404);
    }

    if (attempt.test.teacherId !== teacher.id) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Немає доступу до ресурсу", 403);
    }

    return successResponse(attempt);
  } catch (error) {
    return handleApiError(error);
  }
}
