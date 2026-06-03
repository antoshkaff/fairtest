import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";

export function TestSettingsCard() {
  return (
    <Card className="space-y-4">
      <Input name="title" placeholder="Назва тесту" required />
      <Textarea name="description" placeholder="Опис" />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          Статус
          <select
            name="status"
            className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm"
          >
            <option value="draft">Чернетка</option>
            <option value="published">Опубліковано</option>
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          Ліміт часу, хв
          <Input
            name="timeLimitMinutes"
            type="number"
            min={1}
            max={600}
            placeholder="Без обмеження"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input name="showScore" type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
        Показувати набрані бали студенту після завершення
      </label>
    </Card>
  );
}
