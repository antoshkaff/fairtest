import type { ApiFailure, ApiSuccess } from "@/lib/server/api-response";

export async function readApi<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiSuccess<T> | ApiFailure;

  if (!payload.success) {
    throw new Error(payload.error.message);
  }

  return payload.data;
}
