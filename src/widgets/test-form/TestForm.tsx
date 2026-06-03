"use client";

import { Plus } from "lucide-react";
import { useCreateTest } from "@/features/test-management/create-test/use-create-test";
import { Button } from "@/shared/ui/Button";
import { Spinner } from "@/shared/ui/Spinner";
import { QuestionCard } from "./QuestionCard";
import { TestSettingsCard } from "./TestSettingsCard";
import { useQuestionEditor } from "./use-question-editor";

export function TestForm() {
  const questionEditor = useQuestionEditor();
  const createTestMutation = useCreateTest();

  function onSubmit(formData: FormData) {
    const rawLimit = formData.get("timeLimitMinutes");
    createTestMutation.mutate({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      status: formData.get("status"),
      showScore: formData.get("showScore") === "on",
      timeLimitMinutes: rawLimit ? Number(rawLimit) : undefined,
      questions: questionEditor.getNormalizedQuestions(),
    });
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <TestSettingsCard />

      {questionEditor.questions.map((question, questionIndex) => (
        <QuestionCard
          key={questionIndex}
          question={question}
          questionIndex={questionIndex}
          canRemoveQuestion={questionEditor.questions.length > 1}
          disabled={createTestMutation.isPending}
          onRemoveQuestion={() => questionEditor.removeQuestion(questionIndex)}
          onUpdateQuestion={(nextQuestion) =>
            questionEditor.updateQuestion(questionIndex, nextQuestion)
          }
          onAddOption={() => questionEditor.addOption(questionIndex)}
          onRemoveOption={(optionIndex) => questionEditor.removeOption(questionIndex, optionIndex)}
          onUpdateOption={(optionIndex, nextOption) =>
            questionEditor.updateOption(questionIndex, optionIndex, nextOption)
          }
          onMarkCorrectOption={(optionIndex) =>
            questionEditor.markCorrectOption(questionIndex, optionIndex)
          }
        />
      ))}

      {createTestMutation.error ? (
        <p className="text-sm text-destructive">{createTestMutation.error.message}</p>
      ) : null}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={questionEditor.addQuestion}
          disabled={createTestMutation.isPending}
        >
          <Plus size={16} /> Додати питання
        </Button>
        <Button type="submit" disabled={createTestMutation.isPending}>
          {createTestMutation.isPending ? <Spinner label="Збереження" /> : "Зберегти"}
        </Button>
      </div>
    </form>
  );
}
