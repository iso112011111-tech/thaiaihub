import Link from "next/link";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatCount } from "@/lib/utils";
import type { TrendingItem } from "@/types";

/** Ranked list for the right rail; rank number replaces any icon or graphic. */
export function TrendingList({ items }: { items: TrendingItem[] }) {
  return (
    <Card className="p-4">
      <SectionHeader title="Prompt มาแรง" icon={Flame} href="/explore?sort=trending" />
      <ol className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/prompt/${item.slug}`}
              className="group flex items-start gap-3 rounded-field px-2 py-2 transition-colors hover:bg-surface-muted"
            >
              <span className="mt-px w-4 shrink-0 text-[13px] font-semibold tabular-nums text-ink-muted group-hover:text-accent">
                {item.rank}
              </span>
              <span className="min-w-0 flex-1 text-[13px] leading-snug text-ink-soft group-hover:text-ink">
                {item.title}
              </span>
              <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">
                {formatCount(item.views)}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}
