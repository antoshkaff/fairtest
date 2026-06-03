import type { AttemptStatus, TestStatus } from "@prisma/client";

export function formatTestStatus(status: TestStatus) {
  const labels: Record<TestStatus, string> = {
    draft: "Чернетка",
    published: "Опубліковано",
  };

  return labels[status];
}

export function formatAttemptStatus(status: AttemptStatus) {
  const labels: Record<AttemptStatus, string> = {
    in_progress: "У процесі",
    finished: "Завершено",
  };

  return labels[status];
}
