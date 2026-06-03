import Link from "next/link";
import type { TestAttempt } from "@prisma/client";
import { formatDate } from "@/shared/lib/format-date";
import { formatAttemptStatus } from "@/shared/lib/labels";
import { getRiskLevel } from "@/shared/lib/risk";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";

type TestAttemptsTableProps = {
  attempts: TestAttempt[];
};

export function TestAttemptsTable({ attempts }: TestAttemptsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-muted text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Учасник</th>
            <th className="px-4 py-3 font-semibold">Статус</th>
            <th className="px-4 py-3 font-semibold">Бал</th>
            <th className="px-4 py-3 font-semibold">Ризик</th>
            <th className="px-4 py-3 font-semibold">Початок</th>
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

function EmptyAttemptsRow() {
  return (
    <tr>
      <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
        Спроб ще немає.
      </td>
    </tr>
  );
}
