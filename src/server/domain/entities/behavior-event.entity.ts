export type BehaviorEventProps = {
  id: string;
  attemptId: string;
  eventType: string;
  eventTime: Date;
  duration?: number | null;
  details?: string | null;
};

export class BehaviorEvent {
  id: string;
  attemptId: string;
  eventType: string;
  eventTime: Date;
  duration: number | null;
  details: string | null;

  constructor(props: BehaviorEventProps) {
    this.id = props.id;
    this.attemptId = props.attemptId;
    this.eventType = props.eventType;
    this.eventTime = props.eventTime;
    this.duration = props.duration ?? null;
    this.details = props.details ?? null;
  }
}
