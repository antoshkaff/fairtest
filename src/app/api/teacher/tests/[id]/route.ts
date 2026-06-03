import type { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/server/api-response";
import { requireTeacher } from "@/lib/server/auth";
import { ERROR_CODES, AppError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { validateBody } from "@/lib/server/validate";
import { editTestSchema } from "@/features/test-management/edit-test/schema";

type Params = { params: Promise<{ id: string }> };

async function getOwnedTest(req: NextRequest, id: string) {
  const teacher = await requireTeacher(req);
  const test = await prisma.test.findUnique({
    where: { id },
    include: { questions: { include: { options: true }, orderBy: { order: "asc" } } },
  });

  if (!test) {
    throw new AppError(ERROR_CODES.TEST_NOT_FOUND, "Тест не знайдено", 404);
  }

  if (test.teacherId !== teacher.id) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Немає доступу до ресурсу", 403);
  }

  return test;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    return successResponse(await getOwnedTest(req, id));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await getOwnedTest(req, id);
    const input = validateBody(editTestSchema, await req.json());

    await prisma.question.deleteMany({ where: { testId: id } });
    const test = await prisma.test.update({
      where: { id },
      data: {
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

    return successResponse(test);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await getOwnedTest(req, id);
    const body = await req.json();

    if (body?.status !== "published") {
      throw new AppError(ERROR_CODES.VALIDATION_ERROR, "Некоректний статус", 422);
    }

    const test = await prisma.test.update({
      where: { id },
      data: { status: "published" },
      select: { id: true, status: true },
    });

    return successResponse(test);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await getOwnedTest(req, id);
    await prisma.test.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
