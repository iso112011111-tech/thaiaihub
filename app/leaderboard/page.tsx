import type { Metadata } from "next";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { getTopContributors } from "@/data/community";
import { formatCount } from "@/lib/utils";

export const metadata: Metadata = { title: "กระดานอันดับ" };

// Content lives in Firestore, so this page must not be frozen at build time.
export const revalidate = 60;

export default async function LeaderboardPage() {
  const contributors = await getTopContributors(20);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-ink">กระดานอันดับ</h1>
        <p className="mt-1 text-sm text-ink-muted">
          จัดอันดับจากจำนวน prompt ที่เผยแพร่และคะแนนโหวตสะสม
        </p>
      </header>

      {/* Rows are not links: public profile pages (/u/[handle]) do not exist yet. */}
      <Card className="divide-y divide-line">
        {contributors.map((author, index) => (
          <div key={author.id} className="flex items-center gap-4 px-4 py-3">
            <span className="w-6 text-sm font-semibold tabular-nums text-ink-muted">
              {index + 1}
            </span>
            <Avatar name={author.name} src={author.avatarUrl} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{author.name}</p>
              <p className="truncate text-xs text-ink-muted">@{author.handle}</p>
            </div>
            <span className="text-sm font-semibold tabular-nums text-accent-hover">
              {formatCount(author.promptCount ?? 0)}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
