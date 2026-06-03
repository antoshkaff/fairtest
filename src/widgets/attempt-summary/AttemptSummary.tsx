import type { TestAttempt } from "@prisma/client";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { formatAttemptStatus } from "@/shared/lib/labels";
import { getRiskLevel } from "@/shared/lib/risk";

export function AttemptSummary({ attempt }: { attempt: TestAttempt }) {
  const risk = getRiskLevel(attempt.riskScore);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {attempt.participantFirstName} {attempt.participantLastName}
          </h2>
          <div className="mt-2">
            <Badge variant={attempt.status === "finished" ? "finished" : "progress"}>
              {formatAttemptStatus(attempt.status)}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">{attempt.score ?? 0}</div>
          <div className="text-xs text-muted-foreground">балів</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-sm">
          <span>Рівень ризику</span>
          {risk ? (
            <Badge variant={risk.variant}>
              {risk.label}: {attempt.riskScore}/100
            </Badge>
          ) : (
            <span>0/100</span>
          )}
        </div>
        <ProgressBar value={attempt.riskScore ?? 0} />
      </div>
    </Card>
  );
}
