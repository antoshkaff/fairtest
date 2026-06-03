import { notFound } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import { Card } from "@/shared/ui/Card";

type PageProps = { params: Promise<{ attemptId: string }> };

export default async function AttemptFinishedPage({ params }: PageProps) {
  const { attemptId } = await params;
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      test: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!attempt) {
    notFound();
  }

  const maxScore = attempt.test.questions.reduce((total, question) => total + question.points, 0);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Спробу завершено</h1>
        <p className="mt-2 text-sm text-muted-foreground">Відповіді збережено.</p>
        {attempt.test.showScore ? (
          <div className="mt-5 rounded-md bg-muted px-4 py-3">
            <div className="text-sm text-muted-foreground">Набрано балів</div>
            <div className="text-3xl font-semibold">
              {attempt.score ?? 0} / {maxScore}
            </div>
          </div>
        ) : null}
      </Card>
    </main>
  );
}
