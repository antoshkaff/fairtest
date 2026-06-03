import { cn } from "@/shared/lib/cn";

type QuestionOptionProps = {
  label: string;
  checked?: boolean;
  onChange?: () => void;
};

export function QuestionOption({ label, checked, onChange }: QuestionOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md border border-border bg-white px-3 py-2 text-sm",
        checked && "border-primary ring-2 ring-primary/20",
      )}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}
