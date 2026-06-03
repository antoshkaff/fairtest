import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/server/api-response";
import { requireTeacher } from "@/lib/server/auth";
import { validateBody } from "@/lib/server/validate";
import { testService } from "@/server/modules/test-management/services/test.service";
import { updateTestSchema } from "@/features/test-management/validation/update-test.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const teacher = await requireTeacher(req);
    const { id } = await params;
    return successResponse(await testService.getTeacherTest(teacher.id, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const teacher = await requireTeacher(req);
    const { id } = await params;
    const input = validateBody(updateTestSchema, await req.json());
    const test = await testService.updateTest(teacher.id, id, input);
    return successResponse(test);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const teacher = await requireTeacher(req);
    const { id } = await params;
    const body = await req.json();
    const test = await testService.publishTest(teacher.id, id, body?.status);
    return successResponse(test);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const teacher = await requireTeacher(req);
    const { id } = await params;
    return successResponse(await testService.deleteTest(teacher.id, id));
  } catch (error) {
    return handleApiError(error);
  }
}
