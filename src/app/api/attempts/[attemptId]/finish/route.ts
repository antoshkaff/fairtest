import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/server/api-response";
import { testAttemptService } from "@/server/modules/test-passing/services/test-attempt.service";

type Params = { params: Promise<{ attemptId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { attemptId } = await params;
    const attempt = await testAttemptService.finishAttempt(attemptId);
    return successResponse(attempt);
  } catch (error) {
    return handleApiError(error);
  }
}
