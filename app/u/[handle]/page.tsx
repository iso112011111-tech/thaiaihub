import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { getAuthorProfile } from "@/data/community";
import { formatCount } from "@/lib/utils";

const PAGE_SIZE = 12;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getAuthorProfile(handle);
  return {
    title: profile ? `${profile.author.name} (@${profile.author.handle})` : "ไม่พบผู้ใช้",
  };
}

/** Public author page: who they are and the prompts they have shared. */
export default async function AuthorPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ handle }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const profile = await getAuthorProfile(handle);
  if (!profile) notFound();

  const { author, prompts, totalUpvotes } = profile;
  const totalPages = Math.max(1, Math.ceil(prompts.length / PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1));
  const visible = prompts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <Avatar name={author.name} src={author.avatarUrl} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-ink">{author.name}</h1>
          <p className="mt-0.5 text-sm text-ink-muted">@{author.handle}</p>
        </div>
        <dl className="flex gap-6 text-center">
          <div>
            <dd className="text-lg font-semibold tabular-nums text-ink">{formatCount(prompts.length)}</dd>
            <dt className="text-xs text-ink-muted">Prompt</dt>
          </div>
          <div>
            <dd className="text-lg font-semibold tabular-nums text-ink">{formatCount(totalUpvotes)}</dd>
            <dt className="text-xs text-ink-muted">โหวตสะสม</dt>
          </div>
        </dl>
      </Card>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Prompt ที่แบ่งปัน</h2>
        {visible.length > 0 ? (
          <>
            <FeaturedGrid prompts={visible} />
            <Pagination page={page} totalPages={totalPages} basePath={`/u/${author.handle}`} />
          </>
        ) : (
          <div className="rounded-card border border-dashed border-line-strong py-12 text-center text-sm text-ink-muted">
            ยังไม่ได้แบ่งปัน prompt
          </div>
        )}
      </section>
    </div>
  );
}
