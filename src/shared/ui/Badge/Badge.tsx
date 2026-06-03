import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?:
    | "neutral"
    | "draft"
    | "published"
    | "finished"
    | "progress"
    | "risk"
    | "riskLow"
    | "riskMedium"
    | "riskHigh";
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
        variant === "neutral" && "border-border bg-muted text-muted-foreground",
        variant === "draft" && "border-slate-200 bg-slate-100 text-slate-700",
        variant === "published" && "border-blue-200 bg-primary-light text-primary",
        variant === "finished" && "border-green-200 bg-green-50 text-success",
        variant === "progress" && "border-amber-200 bg-amber-50 text-amber-700",
        variant === "risk" && "border-red-200 bg-red-50 text-red-700",
        variant === "riskLow" && "border-green-200 bg-green-50 text-success",
        variant === "riskMedium" && "border-amber-200 bg-amber-50 text-amber-700",
        variant === "riskHigh" && "border-red-200 bg-red-50 text-red-700",
        className,
      )}
      {...props}
    />
  );
}
