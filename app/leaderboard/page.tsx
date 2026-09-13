import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { getTopContributors } from "@/data/community";
import { formatCount } from "@/lib/utils";

export const metadata: Metadata = { title: "กระดานอันดับ" };

// Content lives in Firestore, so this page must not be frozen at build time.
export const revalidate = 60;

const row = "flex items-center gap-4 px-4 py-3";

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

      {contributors.length === 0 ? (
        <div className="rounded-card border border-dashed border-line-strong py-14 text-center">
          <p className="text-sm font-medium text-ink">ยังไม่มีผู้แบ่งปัน prompt</p>
          <p className="mt-1 text-xs text-ink-muted">อันดับจะขึ้นเมื่อมีคนส่ง prompt แรก</p>
        </div>
      ) : (
      <Card className="divide-y divide-line">
        {contributors.map((author, index) => {
          const content = (
            <>
              <span className="w-6 text-sm font-semibold tabular-nums text-ink-muted">
                {index + 1}
              </span>
              <Avatar name={author.name} src={author.avatarUrl} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{author.name}</p>
                {author.handle ? (
                  <p className="truncate text-xs text-ink-muted">@{author.handle}</p>
                ) : null}
              </div>
              <span className="text-sm font-semibold tabular-nums text-accent-hover">
                {formatCount(author.promptCount ?? 0)}
              </span>
            </>
          );
          // Authors without a username have no profile page to link to.
          return author.handle ? (
            <Link
              key={author.id}
              href={`/u/${author.handle}`}
              className={`${row} transition-colors hover:bg-surface-muted`}
            >
              {content}
            </Link>
          ) : (
            <div key={author.id} className={row}>
              {content}
            </div>
          );
        })}
      </Card>
      )}
    </div>
  );
}
