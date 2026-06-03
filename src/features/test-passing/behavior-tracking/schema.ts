import { z } from "zod";

export const behaviorEventSchema = z.object({
  eventType: z.enum([
    "window_blur",
    "window_focus",
    "tab_hidden",
    "tab_visible",
    "copy",
    "paste",
    "suspicious_pause",
  ]),
  eventTime: z.string().datetime(),
  duration: z.number().int().nonnegative().optional(),
  details: z.string().max(500).optional(),
});

export const behaviorEventsBatchSchema = z.object({
  events: z.array(behaviorEventSchema).max(100),
});
