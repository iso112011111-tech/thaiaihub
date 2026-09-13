import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "electric";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink-muted border-line",
  accent: "bg-accent-soft text-accent-hover border-accent-ring",
  electric: "bg-electric-soft text-electric border-electric/20",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
