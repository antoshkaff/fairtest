import { resultEvaluator } from "@/server/modules/test-passing/services/result-evaluator.service";

export const calculateAttemptScore = resultEvaluator.calculateAttemptScore.bind(resultEvaluator);
