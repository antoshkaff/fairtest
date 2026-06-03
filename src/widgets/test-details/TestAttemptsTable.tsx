import Link from "next/link";
import type { TestAttempt } from "@prisma/client";
import { formatDate } from "@/shared/lib/format-date";
import { formatAttemptStatus } from "@/shared/lib/labels";
import { getRiskLevel } from "@/shared/lib/risk";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";

export type AttemptsSortKey = "participant" | "status" | "score" | "risk" | "startedAt";

type SortDirection = "asc" | "desc";

type TestAttemptsTableProps = {
  attempts: TestAttempt[];
  testId: string;
  sort: AttemptsSortKey;
  direction: SortDirection;
};

export function TestAttemptsTable({ attempts, testId, sort, direction }: TestAttemptsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-muted text-left text-muted-foreground">
          <tr>
            <SortableHeader
              label="Учасник"
              sortKey="participant"
              testId={testId}
              activeSort={sort}
              direction={direction}
            />
            <SortableHeader
              label="Статус"
              sortKey="status"
              testId={testId}
              activeSort={sort}
              direction={direction}
            />
            <SortableHeader
              label="Бал"
              sortKey="score"
              testId={testId}
              activeSort={sort}
              direction={direction}
            />
            <SortableHeader
              label="Ризик"
              sortKey="risk"
              testId={testId}
              activeSort={sort}
              direction={direction}
            />
            <SortableHeader
              label="Початок"
              sortKey="startedAt"
              testId={testId}
              activeSort={sort}
              direction={direction}
            />
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {attempts.map((attempt) => (
            <AttemptRow key={attempt.id} attempt={attempt} />
          ))}
          {attempts.length === 0 ? <EmptyAttemptsRow /> : null}
        </tbody>
      </table>
    </div>
  );
}

function AttemptRow({ attempt }: { attempt: TestAttempt }) {
  const risk = getRiskLevel(attempt.riskScore);

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3">
        {attempt.participantFirstName} {attempt.participantLastName}
      </td>
      <td className="px-4 py-3">
        <Badge variant={attempt.status === "finished" ? "finished" : "progress"}>
          {formatAttemptStatus(attempt.status)}
        </Badge>
      </td>
      <td className="px-4 py-3">{attempt.score ?? "-"}</td>
      <td className="px-4 py-3">
        {risk ? <Badge variant={risk.variant}>{attempt.riskScore}/100</Badge> : "-"}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{formatDate(attempt.startedAt)}</td>
      <td className="px-4 py-3 text-right">
        <Link href={`/teacher/results/${attempt.id}`}>
          <Button variant="secondary">Аналітика</Button>
        </Link>
      </td>
    </tr>
  );
}

function SortableHeader({
  label,
  sortKey,
  testId,
  activeSort,
  direction,
}: {
  label: string;
  sortKey: AttemptsSortKey;
  testId: string;
  activeSort: AttemptsSortKey;
  direction: SortDirection;
}) {
  const isActive = activeSort === sortKey;
  const nextDirection = isActive && direction === "asc" ? "desc" : "asc";
  const indicator = isActive ? (direction === "asc" ? "↑" : "↓") : "↕";

  return (
    <th className="px-4 py-3 font-semibold">
      <Link
        href={`/teacher/tests/${testId}?tab=results&sort=${sortKey}&dir=${nextDirection}`}
        className="inline-flex items-center gap-1 rounded text-left hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <span>{label}</span>
        <span className={isActive ? "text-primary" : "text-muted-foreground"}>{indicator}</span>
      </Link>
    </th>
  );
}

function EmptyAttemptsRow() {
  return (
    <tr>
      <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
        Спроб ще немає.
      </td>
    </tr>
  );
}
