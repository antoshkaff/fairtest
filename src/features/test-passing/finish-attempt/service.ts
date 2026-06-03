import { testAttemptService } from "@/server/modules/test-passing/services/test-attempt.service";

export const finishAttempt = testAttemptService.finishAttempt.bind(testAttemptService);
