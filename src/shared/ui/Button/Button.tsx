import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" &&
          "border border-border bg-white text-foreground hover:bg-primary-light hover:text-primary",
        variant === "success" && "bg-success text-success-foreground hover:bg-success/90",
        variant === "ghost" && "shadow-none hover:bg-primary-light hover:text-primary",
        variant === "danger" &&
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        className,
      )}
      {...props}
    />
  );
}
