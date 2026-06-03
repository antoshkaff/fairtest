import type { TestStatus } from "@prisma/client";

export type TestSummary = {
  id: string;
  title: string;
  description: string | null;
  status: TestStatus;
  createdAt: Date;
  updatedAt: Date;
  questionsCount?: number;
  attemptsCount?: number;
};
