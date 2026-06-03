import type { EventType } from "@prisma/client";
import { BehaviorEvent } from "@/server/domain/entities/behavior-event.entity";

const EVENT_WEIGHTS: Record<EventType, number> = {
  window_blur: 3,
  window_focus: 0,
  tab_hidden: 8,
  tab_visible: 0,
  copy: 10,
  paste: 18,
  suspicious_pause: 12,
};

const MAX_EVENT_CONTRIBUTION: Record<EventType, number> = {
  window_blur: 15,
  window_focus: 0,
  tab_hidden: 32,
  tab_visible: 0,
  copy: 30,
  paste: 45,
  suspicious_pause: 30,
};

export class RiskScoreCalculator {
  calculateRiskScore(events: BehaviorEvent[], questionCount?: number): number {
    const counts = this.countEvents(events);
    const eventScore = (Object.keys(EVENT_WEIGHTS) as EventType[]).reduce((score, eventType) => {
      const raw = counts[eventType] * this.getEventWeight(eventType);
      return score + Math.min(raw, MAX_EVENT_CONTRIBUTION[eventType]);
    }, 0);

    const explicitDurationScore = events.reduce((score, event) => {
      if (!event.duration) return score;
      return score + this.getDurationPenalty(event.duration);
    }, 0);

    const tabAwayDurationScore = this.getPairedTabHiddenDurations(events).reduce(
      (score, seconds) => score + this.getDurationPenalty(seconds),
      0,
    );

    const repetitionPenalty =
      Math.max(0, counts.tab_hidden - 1) * 3 +
      Math.max(0, counts.paste - 1) * 6 +
      Math.max(0, counts.copy - 2) * 3;

    return Math.min(
      Math.round(
        eventScore +
          explicitDurationScore +
          tabAwayDurationScore +
          repetitionPenalty +
          this.getQuestionCoveragePenalty(events, questionCount),
      ),
      100,
    );
  }

  getEventWeight(eventType: string): number {
    return EVENT_WEIGHTS[eventType as EventType] ?? 0;
  }

  private countEvents(events: BehaviorEvent[]) {
    return events.reduce<Record<EventType, number>>(
      (acc, event) => {
        if (event.eventType in acc) {
          acc[event.eventType as EventType] += 1;
        }
        return acc;
      },
      {
        window_blur: 0,
        window_focus: 0,
        tab_hidden: 0,
        tab_visible: 0,
        copy: 0,
        paste: 0,
        suspicious_pause: 0,
      },
    );
  }

  private getDurationPenalty(seconds: number) {
    if (seconds < 10) return 0;
    if (seconds < 30) return 2;
    if (seconds < 60) return 5;
    if (seconds < 180) return 10;
    return 18;
  }

  private getPairedTabHiddenDurations(events: BehaviorEvent[]) {
    const sortedEvents = [...events].sort(
      (left, right) => left.eventTime.getTime() - right.eventTime.getTime(),
    );
    const durations: number[] = [];
    let hiddenAt: Date | null = null;

    for (const event of sortedEvents) {
      if (event.eventType === "tab_hidden") {
        hiddenAt = event.eventTime;
      }

      if (event.eventType === "tab_visible" && hiddenAt) {
        durations.push(
          Math.max(0, Math.floor((event.eventTime.getTime() - hiddenAt.getTime()) / 1000)),
        );
        hiddenAt = null;
      }
    }

    return durations;
  }

  private getQuestionCoveragePenalty(events: BehaviorEvent[], questionCount?: number) {
    if (!questionCount) {
      return 0;
    }

    const riskyQuestionIds = new Set(
      events
        .filter((event) =>
          ["window_blur", "tab_hidden", "copy", "paste", "suspicious_pause"].includes(
            event.eventType,
          ),
        )
        .map((event) => this.getQuestionId(event.details))
        .filter(Boolean),
    );
    const coverage = riskyQuestionIds.size / questionCount;

    if (coverage >= 0.8) return 22;
    if (coverage >= 0.5) return 14;
    if (coverage >= 0.25) return 7;
    return 0;
  }

  private getQuestionId(details?: string | null) {
    const match = details?.match(/questionId:([0-9a-f-]+)/i);
    return match?.[1] ?? null;
  }
}

export const riskScoreCalculator = new RiskScoreCalculator();
