import { z } from "zod";

export const startAttemptSchema = z.object({
  testId: z.string().uuid(),
  participantFirstName: z.string().min(1).max(50),
  participantLastName: z.string().min(1).max(50),
});
