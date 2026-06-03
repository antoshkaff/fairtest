import type { EventType } from "@prisma/client";

export type BehaviorEventView = {
  id: string;
  eventType: EventType;
  eventTime: Date;
  duration: number | null;
  details: string | null;
};
