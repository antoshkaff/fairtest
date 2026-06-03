import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/server/api-response";
import { testService } from "@/server/modules/test-management/services/test.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return successResponse(await testService.getPublicTest(id));
  } catch (error) {
    return handleApiError(error);
  }
}
