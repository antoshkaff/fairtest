import Link from "next/link";
import type { TestStatus } from "@prisma/client";
import { Badge } from "@/shared/ui/Badge";
import { formatDate } from "@/shared/lib/format-date";
import { formatTestStatus } from "@/shared/lib/labels";
import { TestTableActions } from "./TestTableActions";

type TestRow = {
  id: string;
  title: string;
  status: TestStatus;
  updatedAt: Date;
  questions: unknown[];
  _count: { attempts: number };
};

export function TestsTable({ tests }: { tests: TestRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead className="bg-muted text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Назва</th>
            <th className="px-4 py-3 font-semibold">Статус</th>
            <th className="px-4 py-3 font-semibold">Питання</th>
            <th className="px-4 py-3 font-semibold">Спроби</th>
            <th className="px-4 py-3 font-semibold">Оновлено</th>
            <th className="px-4 py-3 text-right font-semibold">Дії</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test) => (
            <tr key={test.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium">
                <Link href={`/teacher/tests/${test.id}`} className="hover:text-primary">
                  {test.title}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Badge variant={test.status === "published" ? "published" : "draft"}>
                  {formatTestStatus(test.status)}
                </Badge>
              </td>
              <td className="px-4 py-3">{test.questions.length}</td>
              <td className="px-4 py-3">{test._count.attempts}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(test.updatedAt)}</td>
              <td className="px-4 py-3">
                <TestTableActions testId={test.id} isPublished={test.status === "published"} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
