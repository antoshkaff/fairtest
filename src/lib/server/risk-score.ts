import { riskScoreCalculator } from "@/server/modules/test-passing/services/risk-score-calculator.service";

export const calculateRiskScore = riskScoreCalculator.calculateRiskScore.bind(riskScoreCalculator);
export const getEventWeight = riskScoreCalculator.getEventWeight.bind(riskScoreCalculator);
