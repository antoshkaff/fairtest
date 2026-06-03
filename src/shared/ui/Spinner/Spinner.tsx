import { cn } from "@/shared/lib/cn";

type SpinnerProps = {
  className?: string;
  label?: string;
};

export function Spinner({ className, label = "Завантаження" }: SpinnerProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      <span>{label}</span>
    </span>
  );
}
