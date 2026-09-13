import Link from "next/link";
import { Star, Users } from "lucide-react";
import { CopyButton } from "./CopyButton";
import { CoverArt } from "./CoverArt";
import { Card } from "@/components/ui/Card";
import { categoryIcons, categoryLabel } from "@/lib/constants";
import { formatCount } from "@/lib/utils";
import type { Prompt } from "@/types";

/**
 * The atom of the whole product. The cover carries a category badge, the body
 * keeps title and one-line summary, and the circular action copies the prompt
 * without leaving the grid. The card itself links through to the detail page.
 */
export function PromptCard({ prompt }: { prompt: Prompt }) {
  const Icon = categoryIcons[prompt.category];

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-card-hover)]">
      <Link href={`/prompt/${prompt.slug}`} className="relative block">
        <CoverArt
          seed={prompt.id}
          label={categoryLabel(prompt.category)}
          src={prompt.coverUrl}
          showLabel={false}
          className="aspect-[16/10] w-full"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-pill bg-ink/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          <Icon className="size-3.5" strokeWidth={2.2} />
          {categoryLabel(prompt.category)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Link href={`/prompt/${prompt.slug}`}>
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-accent-hover">
                {prompt.title}
              </h3>
            </Link>
            <p className="mt-1 mb-3 line-clamp-1 text-xs leading-relaxed text-ink-muted">
              {prompt.excerpt}
            </p>
          </div>
          <CopyButton text={prompt.body} shape="circle" />
        </div>

        <div className="mt-auto flex items-center gap-4 border-t border-line pt-2.5 text-[11px] text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" />
            {formatCount(prompt.views)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-3.5" />
            {prompt.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Card>
  );
}
