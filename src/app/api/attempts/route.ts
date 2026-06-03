import type { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/server/api-response";
import { ERROR_CODES, AppError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { validateBody } from "@/lib/server/validate";
import { startAttemptSchema } from "@/features/test-passing/start-attempt/schema";

export async function POST(req: NextRequest) {
  try {
    const input = validateBody(startAttemptSchema, await req.json());
    const test = await prisma.test.findUnique({
      where: { id: input.testId },
      select: { id: true, status: true },
    });

    if (!test) {
      throw new AppError(ERROR_CODES.TEST_NOT_FOUND, "Тест не знайдено", 404);
    }

    if (test.status !== "published") {
      throw new AppError(ERROR_CODES.TEST_NOT_PUBLISHED, "Тест не опубліковано", 400);
    }

    const attempt = await prisma.testAttempt.create({
      data: {
        testId: input.testId,
        participantFirstName: input.participantFirstName,
        participantLastName: input.participantLastName,
      },
    });

    return successResponse(attempt, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
