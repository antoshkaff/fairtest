import { BehaviorEvent } from "./behavior-event.entity";
import { StudentAnswer } from "./student-answer.entity";

export type TestAttemptProps = {
  id: string;
  testId: string;
  participantFirstName: string;
  participantLastName: string;
  startedAt: Date;
  finishedAt?: Date | null;
  score?: number | null;
  riskScore?: number | null;
  status: string;
  answers?: StudentAnswer[];
  events?: BehaviorEvent[];
};

export class TestAttempt {
  id: string;
  testId: string;
  participantFirstName: string;
  participantLastName: string;
  startedAt: Date;
  finishedAt: Date | null;
  score: number;
  riskScore: number;
  status: string;
  answers: StudentAnswer[];
  events: BehaviorEvent[];

  constructor(props: TestAttemptProps) {
    this.id = props.id;
    this.testId = props.testId;
    this.participantFirstName = props.participantFirstName;
    this.participantLastName = props.participantLastName;
    this.startedAt = props.startedAt;
    this.finishedAt = props.finishedAt ?? null;
    this.score = props.score ?? 0;
    this.riskScore = props.riskScore ?? 0;
    this.status = props.status;
    this.answers = props.answers ?? [];
    this.events = props.events ?? [];
  }

  finishAttempt(): void {
    this.status = "finished";
    this.finishedAt = new Date();
  }
}
