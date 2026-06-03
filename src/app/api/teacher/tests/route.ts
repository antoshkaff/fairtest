import type { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/server/api-response";
import { requireTeacher } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { validateBody } from "@/lib/server/validate";
import { createTestSchema } from "@/features/test-management/create-test/schema";

export async function GET(req: NextRequest) {
  try {
    const teacher = await requireTeacher(req);
    const tests = await prisma.test.findMany({
      where: { teacherId: teacher.id },
      include: {
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return successResponse({
      items: tests.map((test) => ({
        id: test.id,
        title: test.title,
        description: test.description,
        status: test.status,
        createdAt: test.createdAt,
        updatedAt: test.updatedAt,
        questionsCount: test._count.questions,
        attemptsCount: test._count.attempts,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const teacher = await requireTeacher(req);
    const input = validateBody(createTestSchema, await req.json());

    const test = await prisma.test.create({
      data: {
        teacherId: teacher.id,
        title: input.title,
        description: input.description,
        status: input.status,
        showScore: input.showScore,
        timeLimitMinutes: input.timeLimitMinutes,
        questions: {
          create: input.questions.map((question, index) => ({
            text: question.text,
            type: question.type,
            points: question.points,
            order: index + 1,
            options: {
              create:
                question.type === "single_choice"
                  ? question.options.map((option) => ({
                      text: option.text,
                      isCorrect: option.isCorrect,
                    }))
                  : [],
            },
          })),
        },
      },
      include: { questions: { include: { options: true } } },
    });

    return successResponse(test, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
