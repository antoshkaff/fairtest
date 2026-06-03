import { ERROR_CODES, AppError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { calculateRiskScore } from "@/lib/server/risk-score";
import { calculateAttemptScore } from "@/lib/server/score";

export async function finishAttempt(attemptId: string) {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      test: {
        include: {
          questions: {
            include: { options: true },
          },
        },
      },
      answers: {
        include: { answerOption: true },
      },
      behaviorEvents: true,
    },
  });

  if (!attempt) {
    throw new AppError(ERROR_CODES.ATTEMPT_NOT_FOUND, "Спробу тестування не знайдено", 404);
  }

  if (attempt.status === "finished") {
    throw new AppError(
      ERROR_CODES.ATTEMPT_ALREADY_FINISHED,
      "Спроба тестування вже завершена",
      409,
    );
  }

  const score = calculateAttemptScore(attempt.test.questions, attempt.answers);
  const riskScore = calculateRiskScore(attempt.behaviorEvents, attempt.test.questions.length);

  return prisma.testAttempt.update({
    where: { id: attempt.id },
    data: {
      status: "finished",
      finishedAt: new Date(),
      score,
      riskScore,
    },
    include: {
      test: { select: { id: true, title: true } },
    },
  });
}
