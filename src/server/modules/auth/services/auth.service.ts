import bcrypt from "bcryptjs";
import { clearTeacherCookie, createTeacherToken, setTeacherCookie } from "@/lib/server/auth";
import { ERROR_CODES, AppError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export class AuthService {
  async login(input: LoginInput) {
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

    return {
      teacher: {
        id: teacher.id,
        email: teacher.email,
        name: teacher.name,
        createdAt: teacher.createdAt,
      },
    };
  }

  async register(input: RegisterInput) {
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

    return { teacher };
  }

  async logout() {
    await clearTeacherCookie();
    return { loggedOut: true };
  }
}

export const authService = new AuthService();
