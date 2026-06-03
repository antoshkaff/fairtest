import type { NextRequest } from "next/server";
import { handleApiError, successResponse } from "@/lib/server/api-response";
import { validateBody } from "@/lib/server/validate";
import { authService } from "@/server/modules/auth/services/auth.service";
import { registerSchema } from "@/features/auth/validation/register.schema";

export async function POST(req: NextRequest) {
  try {
    const input = validateBody(registerSchema, await req.json());
    return successResponse(await authService.register(input), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
