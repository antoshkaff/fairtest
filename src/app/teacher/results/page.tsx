import Link from "next/link";
import { prisma } from "@/lib/server/prisma";
import { getTeacherFromCookies } from "@/lib/server/auth";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { formatDate } from "@/shared/lib/format-date";
import { formatAttemptStatus } from "@/shared/lib/labels";
import { getRiskLevel } from "@/shared/lib/risk";

export default async function ResultsPage() {
  const teacher = await getTeacherFromCookies();
  const attempts = await prisma.testAttempt.findMany({
    where: { test: { teacherId: teacher?.id } },
    include: { test: true },
    orderBy: { startedAt: "desc" },
  });

  return (
    <section>
      <h1 className="mb-6 text-2xl font-semibold">Результати</h1>
      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Учасник</th>
              <th className="px-4 py-3 font-semibold">Тест</th>
              <th className="px-4 py-3 font-semibold">Статус</th>
              <th className="px-4 py-3 font-semibold">Бал</th>
              <th className="px-4 py-3 font-semibold">Ризик</th>
              <th className="px-4 py-3 font-semibold">Початок</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt) => {
              const risk = getRiskLevel(attempt.riskScore);

              return (
                <tr key={attempt.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    {attempt.participantFirstName} {attempt.participantLastName}
                  </td>
                  <td className="px-4 py-3">{attempt.test.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant={attempt.status === "finished" ? "finished" : "progress"}>
                      {formatAttemptStatus(attempt.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{attempt.score ?? "-"}</td>
                  <td className="px-4 py-3">
                    {risk ? <Badge variant={risk.variant}>{attempt.riskScore}/100</Badge> : "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(attempt.startedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/teacher/results/${attempt.id}`}>
                      <Button variant="secondary">Аналітика</Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
