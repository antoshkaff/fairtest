import { successResponse, handleApiError } from "@/lib/server/api-response";
import { clearTeacherCookie } from "@/lib/server/auth";

export async function POST() {
  try {
    await clearTeacherCookie();
    return successResponse({ loggedOut: true });
  } catch (error) {
    return handleApiError(error);
  }
}
