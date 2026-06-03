export type PublicTestQuestion = {
  id: string;
  text: string;
  type: "single_choice" | "open_text";
  options: { id: string; text: string }[];
};

export type PublicTest = {
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  questions: PublicTestQuestion[];
};

export type PendingBehaviorEvent = {
  eventType:
    | "window_blur"
    | "window_focus"
    | "tab_hidden"
    | "tab_visible"
    | "copy"
    | "paste"
    | "suspicious_pause";
  eventTime: string;
  duration?: number;
  details?: string;
};
