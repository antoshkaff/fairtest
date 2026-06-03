import { handleApiError, successResponse } from "@/lib/server/api-response";
import { authService } from "@/server/modules/auth/services/auth.service";

export async function POST() {
  try {
    return successResponse(await authService.logout());
  } catch (error) {
    return handleApiError(error);
  }
}
