import Link from "next/link";
import type { TestStatus } from "@prisma/client";
import { getTeacherFromCookies } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { Button } from "@/shared/ui/Button";
import { TestsTable, type TestsSortKey } from "@/widgets/tests-table/TestsTable";

type PageProps = {
  searchParams: Promise<{ sort?: string; dir?: string }>;
};

type TestRow = {
  id: string;
  title: string;
  status: TestStatus;
  updatedAt: Date;
  questions: unknown[];
  _count: { attempts: number };
};

const testsSortKeys = new Set<TestsSortKey>([
  "title",
  "status",
  "questions",
  "attempts",
  "updatedAt",
]);

export default async function TeacherTestsPage({ searchParams }: PageProps) {
  const [teacher, query] = await Promise.all([getTeacherFromCookies(), searchParams]);
  const sort = parseTestsSortKey(query.sort);
  const direction = query.dir === "asc" ? "asc" : "desc";

  const tests = await prisma.test.findMany({
    where: { teacherId: teacher?.id },
    include: { questions: true, _count: { select: { attempts: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Тести</h1>
          <p className="text-sm text-muted-foreground">
            Створення, редагування та публікація тестів.
          </p>
        </div>
        <Link href="/teacher/tests/new">
          <Button>Новий тест</Button>
        </Link>
      </div>
      <TestsTable tests={sortTests(tests, sort, direction)} sort={sort} direction={direction} />
    </section>
  );
}

function parseTestsSortKey(sort?: string): TestsSortKey {
  return sort && testsSortKeys.has(sort as TestsSortKey) ? (sort as TestsSortKey) : "updatedAt";
}

function sortTests(tests: TestRow[], sort: TestsSortKey, direction: "asc" | "desc") {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...tests].sort((first, second) => {
    const result = compareTests(first, second, sort);
    return result * multiplier;
  });
}

function compareTests(first: TestRow, second: TestRow, sort: TestsSortKey) {
  switch (sort) {
    case "title":
      return first.title.localeCompare(second.title, "uk");
    case "status":
      return first.status.localeCompare(second.status);
    case "questions":
      return first.questions.length - second.questions.length;
    case "attempts":
      return first._count.attempts - second._count.attempts;
    case "updatedAt":
      return first.updatedAt.getTime() - second.updatedAt.getTime();
  }
}
