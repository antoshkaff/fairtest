import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/server/api-response";
import { createTeacherToken, setTeacherCookie } from "@/lib/server/auth";
import { ERROR_CODES, AppError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { validateBody } from "@/lib/server/validate";
import { loginSchema } from "@/features/auth/login/schema";

export async function POST(req: NextRequest) {
  try {
    const input = validateBody(loginSchema, await req.json());
    const teacher = await prisma.teacher.findUnique({ where: { email: input.email } });
    if (!teacher) {
      throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, "Невірний email або пароль", 401);
    }

    const passwordMatches = await bcrypt.compare(input.password, teacher.passwordHash);
    if (!passwordMatches) {
      throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, "Невірний email або пароль", 401);
    }

    const token = await createTeacherToken(teacher.id);
    await setTeacherCookie(token);

    return successResponse({
      teacher: {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        createdAt: teacher.createdAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
