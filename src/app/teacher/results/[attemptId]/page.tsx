import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTeacherFromCookies } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { AttemptAnswers } from "@/widgets/attempt-answers";
import { AttemptSummary } from "@/widgets/attempt-summary/AttemptSummary";
import { BehaviorTimeline } from "@/widgets/behavior-timeline/BehaviorTimeline";

type PageProps = {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function AttemptAnalyticsPage({ params, searchParams }: PageProps) {
  const teacher = await getTeacherFromCookies();
  const [{ attemptId }, query] = await Promise.all([params, searchParams]);
  const activeTab = query.tab === "behavior" ? "behavior" : "answers";

  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    include: {
      behaviorEvents: { orderBy: { eventTime: "asc" } },
      test: {
        include: {
          questions: { include: { options: true }, orderBy: { order: "asc" } },
        },
      },
      answers: { include: { answerOption: true } },
    },
  });

  if (!attempt || attempt.test.teacherId !== teacher?.id) {
    notFound();
  }

  const questionById = new Map(
    attempt.test.questions.map((question) => [question.id, question.text]),
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{attempt.test.title}</h1>
        <p className="text-sm text-muted-foreground">Аналітика спроби</p>
      </div>

      <AttemptSummary attempt={attempt} />

      <div className="border-b border-border">
        <nav className="flex gap-2">
          <AnalyticsTabLink
            href={`/teacher/results/${attempt.id}?tab=answers`}
            isActive={activeTab === "answers"}
          >
            Відповіді
          </AnalyticsTabLink>
          <AnalyticsTabLink
            href={`/teacher/results/${attempt.id}?tab=behavior`}
            isActive={activeTab === "behavior"}
          >
            Поведінка
          </AnalyticsTabLink>
        </nav>
      </div>

      {activeTab === "answers" ? (
        <AttemptAnswers questions={attempt.test.questions} answers={attempt.answers} />
      ) : (
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Поведінкові події</h2>
          <BehaviorTimeline
            events={attempt.behaviorEvents}
            questionById={questionById}
            finishedAt={attempt.finishedAt}
          />
        </div>
      )}
    </section>
  );
}

function AnalyticsTabLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        isActive
          ? "border-b-2 border-primary px-4 py-3 text-sm font-medium text-primary"
          : "px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
      }
    >
      {children}
    </Link>
  );
}
