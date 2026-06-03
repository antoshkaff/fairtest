import { AnswerOption } from "./answer-option.entity";

export type QuestionProps = {
  id: string;
  testId: string;
  text: string;
  type: string;
  points: number;
  answerOptions?: AnswerOption[];
};

export class Question {
  id: string;
  testId: string;
  text: string;
  type: string;
  points: number;
  answerOptions: AnswerOption[];

  constructor(props: QuestionProps) {
    this.id = props.id;
    this.testId = props.testId;
    this.text = props.text;
    this.type = props.type;
    this.points = props.points;
    this.answerOptions = props.answerOptions ?? [];
  }

  getCorrectAnswer(): AnswerOption | null {
    return this.answerOptions.find((option) => option.isCorrect) ?? null;
  }
}
