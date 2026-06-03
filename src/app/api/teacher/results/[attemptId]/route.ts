import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/server/api-response";
import { requireTeacher } from "@/lib/server/auth";
import { testAttemptService } from "@/server/modules/test-passing/services/test-attempt.service";

type Params = { params: Promise<{ attemptId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const teacher = await requireTeacher(req);
    const { attemptId } = await params;
    return successResponse(
      await testAttemptService.getTeacherAttemptAnalytics(teacher.id, attemptId),
    );
  } catch (error) {
    return handleApiError(error);
  }
}
