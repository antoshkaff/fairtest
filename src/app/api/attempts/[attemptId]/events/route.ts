import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/server/api-response";
import { validateBody } from "@/lib/server/validate";
import { testAttemptService } from "@/server/modules/test-passing/services/test-attempt.service";
import {
  behaviorEventSchema,
  behaviorEventsBatchSchema,
} from "@/features/test-passing/validation/behavior-event.schema";

type Params = { params: Promise<{ attemptId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { attemptId } = await params;
    const body = await req.json();
    const input = Array.isArray(body?.events)
      ? validateBody(behaviorEventsBatchSchema, body)
      : validateBody(behaviorEventSchema, body);
    const result = await testAttemptService.trackEvent(attemptId, input);
    return successResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
