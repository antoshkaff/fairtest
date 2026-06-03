import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/server/api-response";
import { requireTeacher } from "@/lib/server/auth";
import { validateBody } from "@/lib/server/validate";
import { testService } from "@/server/modules/test-management/services/test.service";
import { createTestSchema } from "@/features/test-management/validation/create-test.schema";

export async function GET(req: NextRequest) {
  try {
    const teacher = await requireTeacher(req);
    return successResponse(await testService.listTeacherTests(teacher.id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const teacher = await requireTeacher(req);
    const input = validateBody(createTestSchema, await req.json());
    const test = await testService.createTest(teacher.id, input);
    return successResponse(test, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
