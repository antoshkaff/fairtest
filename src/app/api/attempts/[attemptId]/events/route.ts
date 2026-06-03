import type { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/server/api-response";
import { ERROR_CODES, AppError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { validateBody } from "@/lib/server/validate";
import {
  behaviorEventSchema,
  behaviorEventsBatchSchema,
} from "@/features/test-passing/behavior-tracking/schema";

type Params = { params: Promise<{ attemptId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { attemptId } = await params;
    const body = await req.json();
    const input = Array.isArray(body?.events)
      ? validateBody(behaviorEventsBatchSchema, body)
      : { events: [validateBody(behaviorEventSchema, body)] };

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      select: { id: true },
    });

    if (!attempt) {
      throw new AppError(ERROR_CODES.ATTEMPT_NOT_FOUND, "Attempt not found", 404);
    }

    if (input.events.length === 0) {
      return successResponse({ count: 0 }, 201);
    }

    const result = await prisma.behaviorEvent.createMany({
      data: input.events.map((event) => ({
        attemptId,
        eventType: event.eventType,
        eventTime: new Date(event.eventTime),
        duration: event.duration,
        details: event.details,
      })),
    });

    return successResponse({ count: result.count }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
