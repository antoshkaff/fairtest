import Link from "next/link";
import { getTeacherFromCookies } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { Button } from "@/shared/ui/Button";
import { TestsTable } from "@/widgets/tests-table/TestsTable";

export default async function TeacherTestsPage() {
  const teacher = await getTeacherFromCookies();
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
      <TestsTable tests={tests} />
    </section>
  );
}
