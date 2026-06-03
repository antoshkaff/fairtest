import type { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/server/api-response";
import { ERROR_CODES, AppError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const test = await prisma.test.findUnique({
      where: { id },
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

    return successResponse({
      id: test.id,
      title: test.title,
      description: test.description,
      timeLimitMinutes: test.timeLimitMinutes,
      questions: test.questions,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
