export type AnswerOptionState = {
  text: string;
  isCorrect: boolean;
};

export type QuestionState = {
  text: string;
  type: "single_choice" | "open_text";
  points: number;
  options: AnswerOptionState[];
};
