import type { AnswerOption, Question, StudentAnswer } from "@prisma/client";

type QuestionWithOptions = Question & { options: AnswerOption[] };
type AnswerWithOption = StudentAnswer & { answerOption: AnswerOption | null };

export function calculateAttemptScore(
  questions: QuestionWithOptions[],
  answers: AnswerWithOption[],
) {
  const answerByQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));

  return questions.reduce((score, question) => {
    const answer = answerByQuestion.get(question.id);
    if (!answer) {
      return score;
    }
    return answer.answerOption?.isCorrect ? score + question.points : score;
  }, 0);
}
