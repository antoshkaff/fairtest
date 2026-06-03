import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/server/api-response";
import { requireTeacher } from "@/lib/server/auth";
import { testAttemptService } from "@/server/modules/test-passing/services/test-attempt.service";

export async function GET(req: NextRequest) {
  try {
    const teacher = await requireTeacher(req);
    return successResponse(await testAttemptService.listTeacherResults(teacher.id));
  } catch (error) {
    return handleApiError(error);
  }
}
