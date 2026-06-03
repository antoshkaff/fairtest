import type { Prisma } from "@prisma/client";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";

type QuestionWithOptions = Prisma.QuestionGetPayload<{
  include: { options: true };
}>;

type TestContentProps = {
  description?: string | null;
  questions: QuestionWithOptions[];
};

export function TestContent({ description, questions }: TestContentProps) {
  return (
    <div className="space-y-4">
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {questions.map((question) => (
        <QuestionPreview key={question.id} question={question} />
      ))}
    </div>
  );
}

function QuestionPreview({ question }: { question: QuestionWithOptions }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-medium">
          {question.order}. {question.text}
        </h2>
        <Badge variant="neutral">
          {question.type === "open_text" ? "Відкрита відповідь" : `${question.points} балів`}
        </Badge>
      </div>
      {question.type === "single_choice" ? (
        <ul className="mt-3 space-y-2 text-sm">
          {question.options.map((option) => (
            <li key={option.id} className={option.isCorrect ? "font-medium text-success" : ""}>
              {option.text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          Студент вводить текстову відповідь.
        </p>
      )}
    </Card>
  );
}
