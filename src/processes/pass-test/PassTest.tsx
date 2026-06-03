"use client";

import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { QuestionOption } from "@/shared/ui/QuestionOption";
import { Spinner } from "@/shared/ui/Spinner";
import { Textarea } from "@/shared/ui/Textarea";
import type { PublicTest, PublicTestQuestion } from "./types";
import { formatDuration, usePassTest } from "./use-pass-test";

export function PassTest({ test }: { test: PublicTest }) {
  const passTest = usePassTest(test);

  if (!passTest.attemptId) {
    return (
      <StartAttemptCard
        test={test}
        error={passTest.error}
        isStarting={passTest.startMutation.isPending}
        onStart={(formData) => passTest.startMutation.mutate(formData)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <TestProgressHeader
        title={test.title}
        currentQuestionIndex={passTest.currentQuestionIndex}
        questionCount={test.questions.length}
        progress={passTest.progress}
        elapsedSeconds={passTest.elapsedSeconds}
        remainingSeconds={passTest.remainingSeconds}
        timeLimitSeconds={passTest.timeLimitSeconds}
      />

      <QuestionStepCard
        question={passTest.currentQuestion}
        answer={passTest.answers[passTest.currentQuestion.id] ?? ""}
        disabled={passTest.isSaving}
        onChangeAnswer={(value) =>
          passTest.setAnswers((current) => ({
            ...current,
            [passTest.currentQuestion.id]: value,
          }))
        }
      />

      {passTest.error ? <p className="text-sm text-destructive">{passTest.error}</p> : null}
      <div className="flex justify-end">
        {passTest.isLastQuestion ? (
          <Button onClick={passTest.finish} disabled={passTest.isSaving}>
            {passTest.isSaving ? <Spinner label="Завершення" /> : "Завершити"}
          </Button>
        ) : (
          <Button onClick={passTest.goNext} disabled={passTest.isSaving}>
            {passTest.isSaving ? <Spinner label="Збереження" /> : "Далі"}
          </Button>
        )}
      </div>
    </div>
  );
}

type StartAttemptCardProps = {
  test: PublicTest;
  error: string | null;
  isStarting: boolean;
  onStart: (formData: FormData) => void;
};

function StartAttemptCard({ test, error, isStarting, onStart }: StartAttemptCardProps) {
  return (
    <Card className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold">{test.title}</h1>
      {test.description ? (
        <p className="mt-2 text-sm text-muted-foreground">{test.description}</p>
      ) : null}
      {test.timeLimitMinutes ? (
        <p className="mt-2 text-sm font-medium">Ліміт часу: {test.timeLimitMinutes} хв</p>
      ) : null}
      <form action={onStart} className="mt-6 space-y-4">
        <Input name="participantFirstName" placeholder="Ім'я" required maxLength={50} />
        <Input name="participantLastName" placeholder="Прізвище" required maxLength={50} />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={isStarting}>
          {isStarting ? <Spinner label="Старт" /> : "Почати"}
        </Button>
      </form>
    </Card>
  );
}

type TestProgressHeaderProps = {
  title: string;
  currentQuestionIndex: number;
  questionCount: number;
  progress: number;
  elapsedSeconds: number;
  remainingSeconds: number | null;
  timeLimitSeconds: number | null;
};

function TestProgressHeader({
  title,
  currentQuestionIndex,
  questionCount,
  progress,
  elapsedSeconds,
  remainingSeconds,
  timeLimitSeconds,
}: TestProgressHeaderProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Питання {currentQuestionIndex + 1} з {questionCount}
          </p>
        </div>
        <div className="text-right text-sm">
          {remainingSeconds == null ? (
            <div className="font-medium">Минуло: {formatDuration(elapsedSeconds)}</div>
          ) : (
            <>
              <div className="font-medium">Залишилось: {formatDuration(remainingSeconds)}</div>
              <div className="text-muted-foreground">
                Ліміт: {formatDuration(timeLimitSeconds ?? 0)}
              </div>
            </>
          )}
        </div>
      </div>
      <ProgressBar value={progress} />
    </div>
  );
}

type QuestionStepCardProps = {
  question: PublicTestQuestion;
  answer: string;
  disabled: boolean;
  onChangeAnswer: (value: string) => void;
};

function QuestionStepCard({ question, answer, disabled, onChangeAnswer }: QuestionStepCardProps) {
  return (
    <Card className={disabled ? "pointer-events-none opacity-70" : ""}>
      <h2 className="mb-4 text-lg font-medium">{question.text}</h2>
      {question.type === "single_choice" ? (
        <div className="space-y-2">
          {question.options.map((option) => (
            <QuestionOption
              key={option.id}
              label={option.text}
              checked={answer === option.id}
              onChange={() => onChangeAnswer(option.id)}
            />
          ))}
        </div>
      ) : (
        <Textarea
          value={answer}
          onChange={(event) => onChangeAnswer(event.target.value)}
          placeholder="Введіть відповідь"
          rows={8}
        />
      )}
    </Card>
  );
}
