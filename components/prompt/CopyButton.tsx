"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";

/** Primary card action: puts the full prompt body on the clipboard. */
export function CopyButton({
  text,
  className,
  label = "คัดลอก Prompt",
  /** `circle` is the compact form used in the card's title row. */
  shape = "bar",
}: {
  text: string;
  className?: string;
  label?: string;
  shape?: "bar" | "circle";
}) {
  const { copied, copy } = useCopyToClipboard();
  const Icon = copied ? Check : Copy;

  if (shape === "circle") {
    return (
      <button
        type="button"
        onClick={() => copy(text)}
        aria-label={copied ? "คัดลอกแล้ว" : label}
        aria-live="polite"
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
          copied
            ? "bg-accent text-white"
            : "bg-accent-soft text-accent-hover hover:bg-accent hover:text-white",
          className,
        )}
      >
        <Icon className="size-4" strokeWidth={2.2} />
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={copied ? "primary" : "secondary"}
      size="sm"
      onClick={() => copy(text)}
      aria-live="polite"
      className={cn("w-full", className)}
    >
      <Icon className="size-4" />
      {copied ? "คัดลอกแล้ว" : label}
    </Button>
  );
}
