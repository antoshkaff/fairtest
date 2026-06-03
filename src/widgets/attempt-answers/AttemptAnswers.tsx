import type { Prisma } from "@prisma/client";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";

type QuestionWithOptions = Prisma.QuestionGetPayload<{
  include: { options: true };
}>;

type AnswerWithOption = Prisma.StudentAnswerGetPayload<{
  include: { answerOption: true };
}>;

type AttemptAnswersProps = {
  questions: QuestionWithOptions[];
  answers: AnswerWithOption[];
};

export function AttemptAnswers({ questions, answers }: AttemptAnswersProps) {
  const answerByQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionAnswerCard
          key={question.id}
          question={question}
          answer={answerByQuestion.get(question.id)}
        />
      ))}
    </div>
  );
}

function QuestionAnswerCard({
  question,
  answer,
}: {
  question: QuestionWithOptions;
  answer?: AnswerWithOption;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-medium">
          {question.order}. {question.text}
        </h2>
        <Badge variant="neutral">
          {question.type === "open_text" ? "Відкрита відповідь" : `${question.points} балів`}
        </Badge>
      </div>

      {question.type === "open_text" ? (
        <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm">
          {answer?.answerText || "Відповідь не надано"}
        </p>
      ) : (
        <AnswerOptions question={question} selectedOptionId={answer?.answerOptionId} />
      )}
    </Card>
  );
}

function AnswerOptions({
  question,
  selectedOptionId,
}: {
  question: QuestionWithOptions;
  selectedOptionId?: string | null;
}) {
  return (
    <ul className="mt-3 space-y-2 text-sm">
      {question.options.map((option) => {
        const isSelected = selectedOptionId === option.id;

        return (
          <li
            key={option.id}
            className={
              isSelected
                ? "rounded-md border border-primary bg-primary-light px-3 py-2 font-medium text-primary"
                : "rounded-md border border-border bg-white px-3 py-2"
            }
          >
            <div className="flex items-center justify-between gap-3">
              <span>{option.text}</span>
              <div className="flex gap-2">
                {isSelected ? <Badge variant="published">Відповідь студента</Badge> : null}
                {option.isCorrect ? <Badge variant="finished">Правильна</Badge> : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
