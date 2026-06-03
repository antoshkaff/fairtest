import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/server/api-response";
import { validateBody } from "@/lib/server/validate";
import { testAttemptService } from "@/server/modules/test-passing/services/test-attempt.service";
import { startAttemptSchema } from "@/features/test-passing/validation/start-attempt.schema";

export async function POST(req: NextRequest) {
  try {
    const input = validateBody(startAttemptSchema, await req.json());
    const attempt = await testAttemptService.createAttemptFromInput(input);
    return successResponse(attempt, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
