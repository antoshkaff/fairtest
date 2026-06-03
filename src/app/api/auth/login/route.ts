import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/server/api-response";
import { validateBody } from "@/lib/server/validate";
import { authService } from "@/server/modules/auth/services/auth.service";
import { loginSchema } from "@/features/auth/validation/login.schema";

export async function POST(req: NextRequest) {
  try {
    const input = validateBody(loginSchema, await req.json());
    return successResponse(await authService.login(input));
  } catch (error) {
    return handleApiError(error);
  }
}
