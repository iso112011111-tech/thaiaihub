import Link from "next/link";
import { Eye } from "lucide-react";
import { CoverArt } from "@/components/prompt/CoverArt";
import { Card } from "@/components/ui/Card";
import { categoryLabel } from "@/lib/constants";
import { formatCount } from "@/lib/utils";
import type { Prompt } from "@/types";

/** Compact horizontal list — denser than the card grid, for secondary sections. */
export function PopularRow({ prompts }: { prompts: Prompt[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {prompts.map((prompt) => (
        <Card key={prompt.id} className="transition-colors hover:border-line-strong">
          <Link
            href={`/prompt/${prompt.slug}`}
            className="flex items-center gap-3 p-2.5"
          >
            <CoverArt
              seed={prompt.id}
              label={categoryLabel(prompt.category)}
              src={prompt.coverUrl}
              showLabel={false}
              className="size-14 shrink-0 rounded-[10px]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">
                {prompt.title}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-electric">
                {prompt.tags.slice(0, 2).map((tag) => `#${tag}`).join(" ")}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-ink-muted">
              <Eye className="size-3.5" />
              {formatCount(prompt.views)}
            </span>
          </Link>
        </Card>
      ))}
    </div>
  );
}
