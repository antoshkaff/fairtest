import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-border bg-input px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
}
