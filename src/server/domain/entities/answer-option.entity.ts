export type AnswerOptionProps = {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
};

export class AnswerOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;

  constructor(props: AnswerOptionProps) {
    this.id = props.id;
    this.questionId = props.questionId;
    this.text = props.text;
    this.isCorrect = props.isCorrect;
  }
}
