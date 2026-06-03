import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/server/api-response";
import { validateBody } from "@/lib/server/validate";
import { testAttemptService } from "@/server/modules/test-passing/services/test-attempt.service";
import { answerQuestionSchema } from "@/features/test-passing/validation/save-answer.schema";

type Params = { params: Promise<{ attemptId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { attemptId } = await params;
    const input = validateBody(answerQuestionSchema, await req.json());
    const answer = await testAttemptService.saveAnswer(attemptId, input);
    return successResponse(answer);
  } catch (error) {
    return handleApiError(error);
  }
}
