import type { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/server/api-response";
import { finishAttempt } from "@/features/test-passing/finish-attempt/service";

type Params = { params: Promise<{ attemptId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { attemptId } = await params;
    const attempt = await finishAttempt(attemptId);
    return successResponse(attempt);
  } catch (error) {
    return handleApiError(error);
  }
}
