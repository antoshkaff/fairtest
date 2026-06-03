import type { BehaviorEvent, EventType } from "@prisma/client";
import { cn } from "@/shared/lib/cn";

const EVENT_META: Record<EventType, { label: string; tone: "low" | "medium" | "high" }> = {
  window_blur: { label: "Втрата фокусу вікна", tone: "medium" },
  window_focus: { label: "Повернення фокусу вікна", tone: "low" },
  tab_hidden: { label: "Переключення вкладки", tone: "medium" },
  tab_visible: { label: "Повернення до вкладки", tone: "low" },
  copy: { label: "Копіювання тексту", tone: "high" },
  paste: { label: "Вставка тексту", tone: "high" },
  suspicious_pause: { label: "Підозріла пауза", tone: "medium" },
};

function getQuestionId(details?: string | null) {
  const match = details?.match(/questionId:([0-9a-f-]+)/i);
  return match?.[1] ?? null;
}

function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

type TimelineRow = {
  id: string;
  eventTime: Date;
  title: string;
  duration?: number | null;
  tone: "low" | "medium" | "high" | "finish";
  questionText?: string | null;
};

type BehaviorTimelineProps = {
  events: BehaviorEvent[];
  questionById?: Map<string, string>;
  finishedAt?: Date | null;
};

export function BehaviorTimeline({ events, questionById, finishedAt }: BehaviorTimelineProps) {
  const rows: TimelineRow[] = [
    ...events.map((event) => {
      const questionId = getQuestionId(event.details);
      const meta = EVENT_META[event.eventType];
      return {
        id: event.id,
        eventTime: event.eventTime,
        title: meta.label,
        duration: event.duration,
        tone: meta.tone,
        questionText: questionId ? questionById?.get(questionId) : null,
      };
    }),
    ...(finishedAt
      ? [
          {
            id: "finished",
            eventTime: finishedAt,
            title: "Кінець тестування",
            duration: null,
            tone: "finish" as const,
            questionText: null,
          },
        ]
      : []),
  ].sort((left, right) => left.eventTime.getTime() - right.eventTime.getTime());

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">Поведінкові події не зафіксовані.</p>;
  }

  return (
    <ol className="flex flex-col gap-5 relative  before:absolute before:left-[5px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border">
      {rows.map((row) => (
        <li
          key={row.id}
          className="relative grid grid-cols-[16px_74px_minmax(0,1fr)_88px] items-start gap-4"
        >
          <span
            className={cn(
              "relative z-10 h-3 w-3 rounded-full ",
              row.tone === "low" && "bg-success",
              row.tone === "medium" && "bg-amber-500",
              row.tone === "high" && "bg-red-500",
              row.tone === "finish" && "bg-violet-600",
            )}
          />
          <time className="text-xs font-medium text-muted-foreground leading-none">
            {formatTime(row.eventTime)}
          </time>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">{row.title}</div>
            {row.questionText ? (
              <div className="mt-1 truncate text-xs text-muted-foreground">
                Питання: {row.questionText}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
