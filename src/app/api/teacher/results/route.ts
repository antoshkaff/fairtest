import type { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/server/api-response";
import { requireTeacher } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";

export async function GET(req: NextRequest) {
  try {
    const teacher = await requireTeacher(req);
    const attempts = await prisma.testAttempt.findMany({
      where: { test: { teacherId: teacher.id } },
      include: {
        test: { select: { id: true, title: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    return successResponse({ items: attempts });
  } catch (error) {
    return handleApiError(error);
  }
}
