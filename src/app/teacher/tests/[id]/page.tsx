import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma, TestAttempt } from "@prisma/client";
import type { ReactNode } from "react";
import { getTeacherFromCookies } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { TestAttemptsTable, TestContent, type AttemptsSortKey } from "@/widgets/test-details";
import { formatTestStatus } from "@/shared/lib/labels";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; sort?: string; dir?: string }>;
};

type TestWithDetails = Prisma.TestGetPayload<{
  include: {
    questions: { include: { options: true } };
    attempts: true;
    _count: { select: { attempts: true } };
  };
}>;

const attemptsSortKeys = new Set<AttemptsSortKey>([
  "participant",
  "status",
  "score",
  "risk",
  "startedAt",
]);

export default async function TeacherTestDetailPage({ params, searchParams }: PageProps) {
  const teacher = await getTeacherFromCookies();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const activeTab = query.tab === "test" ? "test" : "results";
  const sort = parseAttemptsSortKey(query.sort);
  const direction = query.dir === "asc" ? "asc" : "desc";

  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      questions: { include: { options: true }, orderBy: { order: "asc" } },
      attempts: { orderBy: { startedAt: "desc" } },
      _count: { select: { attempts: true } },
    },
  });

  if (!test || test.teacherId !== teacher?.id) {
    notFound();
  }

  return (
    <section className="space-y-5">
      <TestDetailHeader test={test} />

      <div className="border-b border-border">
        <nav className="flex gap-2">
          <TestTabLink
            href={`/teacher/tests/${test.id}?tab=results&sort=${sort}&dir=${direction}`}
            isActive={activeTab === "results"}
          >
            Результати
          </TestTabLink>
          <TestTabLink href={`/teacher/tests/${test.id}?tab=test`} isActive={activeTab === "test"}>
            Тест
          </TestTabLink>
        </nav>
      </div>

      {activeTab === "results" ? (
        <TestAttemptsTable
          attempts={sortAttempts(test.attempts, sort, direction)}
          testId={test.id}
          sort={sort}
          direction={direction}
        />
      ) : (
        <TestContent description={test.description} questions={test.questions} />
      )}
    </section>
  );
}

function TestDetailHeader({ test }: { test: TestWithDetails }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{test.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={test.status === "published" ? "published" : "draft"}>
            {formatTestStatus(test.status)}
          </Badge>
          <span className="text-sm text-muted-foreground">{test._count.attempts} спроб</span>
          {test.timeLimitMinutes ? (
            <Badge variant="neutral">Ліміт: {test.timeLimitMinutes} хв</Badge>
          ) : null}
        </div>
      </div>

      {test.status === "published" ? (
        <Link href={`/test/${test.id}`}>
          <Button variant="success">Відкрити публічний тест</Button>
        </Link>
      ) : null}
    </div>
  );
}

function TestTabLink({
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

function parseAttemptsSortKey(sort?: string): AttemptsSortKey {
  return sort && attemptsSortKeys.has(sort as AttemptsSortKey)
    ? (sort as AttemptsSortKey)
    : "startedAt";
}

function sortAttempts(attempts: TestAttempt[], sort: AttemptsSortKey, direction: "asc" | "desc") {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...attempts].sort((first, second) => {
    const result = compareAttempts(first, second, sort);
    return result * multiplier;
  });
}

function compareAttempts(first: TestAttempt, second: TestAttempt, sort: AttemptsSortKey) {
  switch (sort) {
    case "participant":
      return getParticipantName(first).localeCompare(getParticipantName(second), "uk");
    case "status":
      return first.status.localeCompare(second.status);
    case "score":
      return (first.score ?? -1) - (second.score ?? -1);
    case "risk":
      return (first.riskScore ?? 0) - (second.riskScore ?? 0);
    case "startedAt":
      return first.startedAt.getTime() - second.startedAt.getTime();
  }
}

function getParticipantName(attempt: TestAttempt) {
  return `${attempt.participantFirstName} ${attempt.participantLastName}`;
}
