export function getRiskLevel(score: number | null | undefined) {
  if (score == null) {
    return null;
  }

  if (score >= 60) {
    return { label: "Високий ризик", variant: "riskHigh" as const };
  }

  if (score >= 25) {
    return { label: "Середній ризик", variant: "riskMedium" as const };
  }

  return { label: "Низький ризик", variant: "riskLow" as const };
}
