import { cn } from "@/lib/utils";

/** The one surface primitive: white panel, hairline border, soft elevation. */
export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface shadow-[var(--shadow-rail)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
