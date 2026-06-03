export type QuestionDraft = {
  id?: string;
  text: string;
  points: number;
  options: AnswerOptionDraft[];
};

export type AnswerOptionDraft = {
  id?: string;
  text: string;
  isCorrect: boolean;
};
