import Link from "next/link";
import { categories } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types";

/**
 * Link-based filter chips — each state is a real URL, so filters are
 * shareable, crawlable, and need no client JavaScript.
 */
export function CategoryFilter({
  active = "all",
  basePath = "/explore",
}: {
  active?: CategoryId;
  basePath?: string;
}) {
  return (
    // Wrapping beats a horizontal scroller here: on a phone a cut-off chip row
    // reads as broken layout, and 9 chips only need two lines.
    <div className="flex flex-wrap items-center gap-2 py-1">
      <span className="shrink-0 text-xs font-medium text-ink-muted">
        หมวดหมู่
      </span>
      {categories.map((category) => {
        const isActive = category.id === active;
        const href =
          category.id === "all" ? basePath : `${basePath}?category=${category.id}`;
        return (
          <Link
            key={category.id}
            href={href}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "shrink-0 rounded-pill border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              isActive
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-ink-soft hover:border-accent-ring hover:text-accent-hover",
            )}
          >
            {category.label}
          </Link>
        );
      })}
    </div>
  );
}
