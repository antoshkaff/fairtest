type ProgressBarProps = {
  value: number;
  max?: number;
};

export function ProgressBar({ value, max = 100 }: ProgressBarProps) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full bg-primary" style={{ width: `${width}%` }} />
    </div>
  );
}
