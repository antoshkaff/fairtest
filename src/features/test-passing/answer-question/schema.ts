import { z } from "zod";

export const answerQuestionSchema = z
  .object({
    questionId: z.string().uuid(),
    answerOptionId: z.string().uuid().optional(),
    answerText: z.string().min(1).max(5000).optional(),
  })
  .refine((value) => value.answerOptionId || value.answerText, {
    message: "Answer option or answer text is required",
  });
