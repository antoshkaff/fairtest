import { Question } from "./question.entity";

export type TestProps = {
  id: string;
  title: string;
  description?: string | null;
  timeLimit?: number | null;
  isPublished: boolean;
  questions?: Question[];
};

export class Test {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  isPublished: boolean;
  questions: Question[];

  constructor(props: TestProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description ?? "";
    this.timeLimit = props.timeLimit ?? 0;
    this.isPublished = props.isPublished;
    this.questions = props.questions ?? [];
  }

  getQuestions(): Question[] {
    return this.questions;
  }
}
