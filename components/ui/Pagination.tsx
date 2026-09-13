import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Link-based page navigation. Like the category chips, every page is a real
 * URL (`?page=3`), so results stay shareable and work without client JS.
 */
export function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  /** Query params to carry across pages, e.g. the search text and category. */
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));
    const search = query.toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  const item =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-pill border px-3 text-sm font-medium transition-colors";
  const idle = "border-line bg-surface text-ink-soft hover:border-accent-ring hover:text-accent-hover";
  const disabled = "pointer-events-none border-line bg-surface text-ink-muted opacity-50";

  return (
    <nav aria-label="เปลี่ยนหน้า" className="flex flex-wrap items-center justify-center gap-2 pt-2">
      <Link
        href={href(page - 1)}
        aria-label="หน้าก่อนหน้า"
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}
        className={cn(item, page <= 1 ? disabled : idle)}
      >
        <ChevronLeft className="size-4" />
      </Link>

      {pageWindow(page, totalPages).map((entry, index) =>
        entry === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-ink-muted" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={href(entry)}
            aria-current={entry === page ? "page" : undefined}
            className={cn(item, entry === page ? "border-accent bg-accent text-white" : idle)}
          >
            {entry}
          </Link>
        ),
      )}

      <Link
        href={href(page + 1)}
        aria-label="หน้าถัดไป"
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : undefined}
        className={cn(item, page >= totalPages ? disabled : idle)}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}

/** First, last, and the pages next to the current one: 1 … 4 5 6 … 20. */
function pageWindow(page: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  for (const n of sorted) {
    const previous = result[result.length - 1];
    if (typeof previous === "number" && n - previous > 1) {
      // A gap of exactly one page is shown as that page, not as "…".
      if (n - previous === 2) result.push(previous + 1);
      else result.push("gap");
    }
    result.push(n);
  }
  return result;
}
