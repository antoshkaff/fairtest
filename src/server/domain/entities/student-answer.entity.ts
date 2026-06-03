export type StudentAnswerProps = {
  id: string;
  attemptId: string;
  questionId: string;
  answerOptionId?: string | null;
  textAnswer?: string | null;
  isCorrect?: boolean;
  pointsEarned?: number;
};

export class StudentAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answerOptionId: string | null;
  textAnswer: string | null;
  isCorrect: boolean;
  pointsEarned: number;

  constructor(props: StudentAnswerProps) {
    this.id = props.id;
    this.attemptId = props.attemptId;
    this.questionId = props.questionId;
    this.answerOptionId = props.answerOptionId ?? null;
    this.textAnswer = props.textAnswer ?? null;
    this.isCorrect = props.isCorrect ?? false;
    this.pointsEarned = props.pointsEarned ?? 0;
  }
}
