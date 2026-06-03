import type { ApiFailure, ApiSuccess } from "@/lib/server/api-response";

export async function httpClient<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const payload = (await response.json()) as ApiSuccess<T> | ApiFailure;

  if (!payload.success) {
    throw new Error(payload.error.message);
  }

  return payload.data;
}
