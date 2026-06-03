import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/server/api-response";
import { createTeacherToken, setTeacherCookie } from "@/lib/server/auth";
import { ERROR_CODES, AppError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { validateBody } from "@/lib/server/validate";
import { registerSchema } from "@/features/auth/register/schema";

export async function POST(req: NextRequest) {
  try {
    const input = validateBody(registerSchema, await req.json());
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existingTeacher) {
      throw new AppError(ERROR_CODES.CONFLICT, "Викладач з таким email вже існує", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const teacher = await prisma.teacher.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = await createTeacherToken(teacher.id);
    await setTeacherCookie(token);

    return successResponse({ teacher }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
