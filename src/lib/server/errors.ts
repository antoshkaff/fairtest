import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  TEST_NOT_FOUND: "TEST_NOT_FOUND",
  TEST_NOT_PUBLISHED: "TEST_NOT_PUBLISHED",
  QUESTION_NOT_FOUND: "QUESTION_NOT_FOUND",
  ATTEMPT_NOT_FOUND: "ATTEMPT_NOT_FOUND",
  ATTEMPT_ALREADY_FINISHED: "ATTEMPT_ALREADY_FINISHED",
  INVALID_ANSWER: "INVALID_ANSWER",
  INVALID_EVENT_TYPE: "INVALID_EVENT_TYPE",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status = mapErrorToStatus(code),
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function mapErrorToStatus(code: ErrorCode): number {
  switch (code) {
    case ERROR_CODES.VALIDATION_ERROR:
      return 422;
    case ERROR_CODES.UNAUTHORIZED:
    case ERROR_CODES.INVALID_CREDENTIALS:
    case ERROR_CODES.TOKEN_EXPIRED:
    case ERROR_CODES.TOKEN_INVALID:
      return 401;
    case ERROR_CODES.FORBIDDEN:
      return 403;
    case ERROR_CODES.NOT_FOUND:
    case ERROR_CODES.TEST_NOT_FOUND:
    case ERROR_CODES.QUESTION_NOT_FOUND:
    case ERROR_CODES.ATTEMPT_NOT_FOUND:
      return 404;
    case ERROR_CODES.CONFLICT:
    case ERROR_CODES.ATTEMPT_ALREADY_FINISHED:
      return 409;
    case ERROR_CODES.TEST_NOT_PUBLISHED:
    case ERROR_CODES.INVALID_ANSWER:
    case ERROR_CODES.INVALID_EVENT_TYPE:
      return 400;
    default:
      return 500;
  }
}

function formatZodPath(path: (string | number)[]) {
  if (path.length === 0) {
    return "body";
  }
  return path
    .map((segment) => (typeof segment === "number" ? `[${segment}]` : segment))
    .join(".")
    .replace(".[", "[");
}

function formatZodError(error: ZodError) {
  const issues = error.issues.map((issue) => ({
    path: formatZodPath(issue.path),
    message: issue.message,
  }));

  return {
    issues,
    fieldErrors: issues.reduce<Record<string, string[]>>((acc, issue) => {
      acc[issue.path] = [...(acc[issue.path] ?? []), issue.message];
      return acc;
    }, {}),
  };
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    const details = formatZodError(error);
    const firstIssue = details.issues[0];
    return new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      firstIssue
        ? `Некоректні дані: ${firstIssue.path} - ${firstIssue.message}`
        : "Некоректні дані",
      422,
      details,
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return new AppError(ERROR_CODES.CONFLICT, "Конфлікт даних", 409, error.meta);
  }

  return new AppError(ERROR_CODES.INTERNAL_ERROR, "Неочікувана помилка сервера", 500);
}
