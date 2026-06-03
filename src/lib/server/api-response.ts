import { NextResponse } from "next/server";
import { type ErrorCode, normalizeError } from "./errors";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, { status });
}

export function errorResponse(
  errorCode: ErrorCode,
  message: string,
  status: number,
  details?: unknown,
) {
  return NextResponse.json<ApiFailure>(
    {
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details === undefined ? {} : { details }),
      },
    },
    { status },
  );
}

export function handleApiError(error: unknown) {
  const appError = normalizeError(error);
  return errorResponse(appError.code, appError.message, appError.status, appError.details);
}
