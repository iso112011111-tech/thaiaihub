import { Slot } from "./Slot";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover shadow-[0_1px_2px_rgb(11_17_23/0.08)]",
  secondary: "bg-accent-soft text-accent-hover hover:bg-accent-ring",
  outline:
    "border border-line bg-surface text-ink-soft hover:border-accent hover:text-accent-hover",
  ghost: "text-ink-soft hover:bg-surface-muted hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Render the single child element instead of a <button> — e.g. wrap a <Link>. */
  asChild?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-pill font-medium",
        "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
