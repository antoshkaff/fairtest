import type { AttemptStatus } from "@prisma/client";

export type AttemptSummary = {
  id: string;
  participantFirstName: string;
  participantLastName: string;
  status: AttemptStatus;
  score: number | null;
  riskScore: number | null;
  startedAt: Date;
  finishedAt: Date | null;
};
