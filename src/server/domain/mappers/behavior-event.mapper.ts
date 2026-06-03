import type { BehaviorEvent as PrismaBehaviorEvent } from "@prisma/client";
import { BehaviorEvent } from "../entities/behavior-event.entity";

export function mapPrismaBehaviorEventToEntity(event: PrismaBehaviorEvent): BehaviorEvent {
  return new BehaviorEvent({
    id: event.id,
    attemptId: event.attemptId,
    eventType: event.eventType,
    eventTime: event.eventTime,
    duration: event.duration,
    details: event.details,
  });
}
