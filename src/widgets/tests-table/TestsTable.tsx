import Link from "next/link";
import type { TestStatus } from "@prisma/client";
import { formatDate } from "@/shared/lib/format-date";
import { formatTestStatus } from "@/shared/lib/labels";
import { Badge } from "@/shared/ui/Badge";
import { TestTableActions } from "./TestTableActions";

export type TestsSortKey = "title" | "status" | "questions" | "attempts" | "updatedAt";

type SortDirection = "asc" | "desc";

type TestRow = {
  id: string;
  title: string;
  status: TestStatus;
  updatedAt: Date;
  questions: unknown[];
  _count: { attempts: number };
};

type TestsTableProps = {
  tests: TestRow[];
  sort: TestsSortKey;
  direction: SortDirection;
};

export function TestsTable({ tests, sort, direction }: TestsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead className="bg-muted text-left text-muted-foreground">
          <tr>
            <SortableHeader label="Назва" sortKey="title" activeSort={sort} direction={direction} />
            <SortableHeader
              label="Статус"
              sortKey="status"
              activeSort={sort}
              direction={direction}
            />
            <SortableHeader
              label="Питання"
              sortKey="questions"
              activeSort={sort}
              direction={direction}
            />
            <SortableHeader
              label="Спроби"
              sortKey="attempts"
              activeSort={sort}
              direction={direction}
            />
            <SortableHeader
              label="Оновлено"
              sortKey="updatedAt"
              activeSort={sort}
              direction={direction}
            />
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

function SortableHeader({
  label,
  sortKey,
  activeSort,
  direction,
}: {
  label: string;
  sortKey: TestsSortKey;
  activeSort: TestsSortKey;
  direction: SortDirection;
}) {
  const isActive = activeSort === sortKey;
  const nextDirection = isActive && direction === "asc" ? "desc" : "asc";
  const indicator = isActive ? (direction === "asc" ? "↑" : "↓") : "↕";

  return (
    <th className="px-4 py-3 font-semibold">
      <Link
        href={`/teacher/tests?sort=${sortKey}&dir=${nextDirection}`}
        className="inline-flex items-center gap-1 rounded text-left hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <span>{label}</span>
        <span className={isActive ? "text-primary" : "text-muted-foreground"}>{indicator}</span>
      </Link>
    </th>
  );
}
