import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

/** Shared "title + optional see-all link" row used above every content block. */
export function SectionHeader({
  title,
  icon: Icon,
  href,
  actionLabel = "ดูทั้งหมด",
}: {
  title: string;
  icon?: LucideIcon;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink">
        {Icon ? <Icon className="size-4 text-accent" strokeWidth={2.2} /> : null}
        {title}
      </h2>
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted transition-colors hover:text-accent-hover"
        >
          {actionLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
