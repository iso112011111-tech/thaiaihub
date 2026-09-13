import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-field border border-line bg-surface px-3.5 text-sm text-ink",
        "placeholder:text-ink-muted transition-colors focus:border-accent focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
