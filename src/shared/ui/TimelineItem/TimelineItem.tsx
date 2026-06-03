type TimelineItemProps = {
  title: string;
  time: Date | string;
  description?: string | null;
};

function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
}

export function TimelineItem({ title, time, description }: TimelineItemProps) {
  return (
    <li className="border-l border-border pl-4">
      <div className="-ml-[21px] mb-1 h-3 w-3 rounded-full border-2 border-primary bg-white" />
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{formatTime(time)}</div>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </li>
  );
}
