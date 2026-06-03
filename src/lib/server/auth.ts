import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { ERROR_CODES, AppError } from "./errors";
import { prisma } from "./prisma";

const COOKIE_NAME = "fairtest_token";
const encoder = new TextEncoder();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "JWT secret is not configured", 500);
  }
  return encoder.encode(secret);
}

async function getTeacherByToken(token?: string) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const teacherId = payload.teacherId;
    if (typeof teacherId !== "string") {
      throw new AppError(ERROR_CODES.TOKEN_INVALID, "Invalid token", 401);
    }

    return prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(ERROR_CODES.TOKEN_INVALID, "Invalid token", 401);
  }
}

export async function createTeacherToken(teacherId: string) {
  return new SignJWT({ teacherId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function setTeacherCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearTeacherCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getTeacherFromRequest(req: NextRequest) {
  return getTeacherByToken(req.cookies.get(COOKIE_NAME)?.value);
}

export async function getTeacherFromCookies() {
  const cookieStore = await cookies();
  return getTeacherByToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function requireTeacher(req: NextRequest) {
  const teacher = await getTeacherFromRequest(req);
  if (!teacher) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized", 401);
  }
  return teacher;
}
