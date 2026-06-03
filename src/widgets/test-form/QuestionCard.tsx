import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import type { AnswerOptionState, QuestionState } from "./types";

type QuestionCardProps = {
  question: QuestionState;
  questionIndex: number;
  canRemoveQuestion: boolean;
  disabled?: boolean;
  onRemoveQuestion: () => void;
  onUpdateQuestion: (nextQuestion: Partial<QuestionState>) => void;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
  onUpdateOption: (optionIndex: number, nextOption: Partial<AnswerOptionState>) => void;
  onMarkCorrectOption: (optionIndex: number) => void;
};

export function QuestionCard({
  question,
  questionIndex,
  canRemoveQuestion,
  disabled,
  onRemoveQuestion,
  onUpdateQuestion,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  onMarkCorrectOption,
}: QuestionCardProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Питання {questionIndex + 1}</h2>
        <Button
          type="button"
          variant="ghost"
          onClick={onRemoveQuestion}
          disabled={!canRemoveQuestion || disabled}
          title="Видалити питання"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      <Textarea
        value={question.text}
        onChange={(event) => onUpdateQuestion({ text: event.target.value })}
        placeholder="Текст питання"
        required
      />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          Тип питання
          <select
            value={question.type}
            onChange={(event) =>
              onUpdateQuestion({ type: event.target.value as QuestionState["type"] })
            }
            className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
          >
            <option value="single_choice">Варіанти відповіді</option>
            <option value="open_text">Відкрита відповідь</option>
          </select>
        </label>

        {question.type === "single_choice" ? (
          <label className="space-y-1 text-sm font-medium">
            Кількість балів
            <Input
              type="number"
              min={1}
              value={question.points}
              onChange={(event) => onUpdateQuestion({ points: Number(event.target.value) })}
            />
          </label>
        ) : null}
      </div>

      {question.type === "single_choice" ? (
        <AnswerOptionsEditor
          options={question.options}
          disabled={disabled}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
          onUpdateOption={onUpdateOption}
          onMarkCorrectOption={onMarkCorrectOption}
        />
      ) : (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          Студент введе текстову відповідь. Вона збережеться для перевірки викладачем, без
          автоматичного нарахування балів.
        </p>
      )}
    </Card>
  );
}

type AnswerOptionsEditorProps = {
  options: AnswerOptionState[];
  disabled?: boolean;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
  onUpdateOption: (optionIndex: number, nextOption: Partial<AnswerOptionState>) => void;
  onMarkCorrectOption: (optionIndex: number) => void;
};

function AnswerOptionsEditor({
  options,
  disabled,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  onMarkCorrectOption,
}: AnswerOptionsEditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {options.map((option, optionIndex) => (
          <div key={optionIndex} className="flex items-center gap-2">
            <input
              type="radio"
              checked={option.isCorrect}
              onChange={() => onMarkCorrectOption(optionIndex)}
              className="h-4 w-4 accent-primary"
            />
            <Input
              value={option.text}
              onChange={(event) => onUpdateOption(optionIndex, { text: event.target.value })}
              placeholder={`Варіант ${optionIndex + 1}`}
              required
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => onRemoveOption(optionIndex)}
              disabled={options.length <= 2 || disabled}
              title="Видалити варіант"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" onClick={onAddOption} disabled={disabled}>
        <Plus size={16} /> Додати варіант
      </Button>
    </div>
  );
}
