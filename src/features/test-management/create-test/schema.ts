import { z } from "zod";

const answerOptionSchema = z.object({
  id: z.string().uuid().optional(),
  text: z.string().min(1, "Заповніть текст варіанта відповіді").max(500),
  isCorrect: z.boolean(),
});

const baseQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  text: z.string().min(1, "Заповніть текст питання").max(1000),
});

const singleChoiceQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("single_choice"),
  points: z
    .number()
    .int("Бали мають бути цілим числом")
    .positive("Бали мають бути більше 0")
    .max(100),
  options: z
    .array(answerOptionSchema)
    .min(2, "Додайте щонайменше два варіанти відповіді")
    .refine((options) => options.some((option) => option.isCorrect), {
      message: "Позначте правильний варіант відповіді",
    }),
});

const openTextQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("open_text"),
  points: z.number().int().nonnegative().default(0),
  options: z
    .array(z.unknown())
    .default([])
    .transform(() => []),
});

const questionSchema = z.discriminatedUnion("type", [
  singleChoiceQuestionSchema,
  openTextQuestionSchema,
]);

export const createTestSchema = z.object({
  title: z.string().min(1, "Заповніть назву тесту").max(150),
  description: z.string().max(1000).optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  showScore: z.boolean().default(true),
  timeLimitMinutes: z.number().int().positive().max(600).optional(),
  questions: z.array(questionSchema).min(1, "Додайте хоча б одне питання"),
});

export type CreateTestInput = z.infer<typeof createTestSchema>;
