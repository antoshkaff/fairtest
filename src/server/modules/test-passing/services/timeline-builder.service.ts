import { BehaviorEvent } from "@/server/domain/entities/behavior-event.entity";

export class TimelineBuilder {
  buildTimeline(events: BehaviorEvent[]): BehaviorEvent[] {
    return this.sortEventsByTime(events);
  }

  sortEventsByTime(events: BehaviorEvent[]): BehaviorEvent[] {
    return [...events].sort((left, right) => left.eventTime.getTime() - right.eventTime.getTime());
  }
}

export const timelineBuilder = new TimelineBuilder();
