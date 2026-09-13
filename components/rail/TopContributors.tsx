import Link from "next/link";
import { Trophy } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatCount } from "@/lib/utils";
import type { Author } from "@/types";

export function TopContributors({ authors }: { authors: Author[] }) {
  return (
    <Card className="p-4">
      <SectionHeader title="ผู้แบ่งปันยอดนิยม" icon={Trophy} href="/leaderboard" />
      <ul className="space-y-0.5">
        {authors.map((author) => (
          <li key={author.id}>
            <Link
              href={`/u/${author.handle}`}
              className="flex items-center gap-3 rounded-field px-2 py-2 transition-colors hover:bg-surface-muted"
            >
              <Avatar name={author.name} src={author.avatarUrl} size="sm" />
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-soft">
                {author.name}
              </span>
              <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">
                {formatCount(author.promptCount ?? 0)} prompts
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
