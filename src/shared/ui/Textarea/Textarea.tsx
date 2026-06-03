import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
}
