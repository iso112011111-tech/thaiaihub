import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowBigUp, FileText, Users } from "lucide-react";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAuthorByHandle, getPromptsByAuthorId } from "@/data/prompts";
import { formatCount } from "@/lib/utils";

/** Same page size as /explore: three full rows on the widest grid. */
const PAGE_SIZE = 12;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const author = await getAuthorByHandle(handle);
  if (!author) return { title: "ไม่พบผู้ใช้" };

  const title = `${author.name} (@${author.handle}) — นักสร้าง Prompt`;
  const description = `รวมผลงาน Prompt AI ที่สร้างและแบ่งปันโดย ${author.name} (@${author.handle}) บน Thai AI Hub`;
  const url = `${SITE_URL}/u/${encodeURIComponent(author.handle)}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "profile",
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "th_TH",
      images: author.avatarUrl ? [{ url: author.avatarUrl }] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: author.avatarUrl ? [author.avatarUrl] : undefined,
    },
  };
}

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ handle }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const author = await getAuthorByHandle(handle);
  if (!author) notFound();

  const prompts = await getPromptsByAuthorId(author.id);
  const totalViews = prompts.reduce((sum, p) => sum + p.views, 0);
  const totalUpvotes = prompts.reduce((sum, p) => sum + p.upvotes, 0);

  // A prolific author must not turn this into one endless page.
  const totalPages = Math.max(1, Math.ceil(prompts.length / PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1));
  const visible = prompts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE_URL}/u/${encodeURIComponent(author.handle)}`,
    name: `${author.name} (@${author.handle})`,
    mainEntity: {
      "@type": "Person",
      name: author.name,
      alternateName: author.handle,
      ...(author.avatarUrl ? { image: author.avatarUrl } : {}),
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/WriteAction",
          userInteractionCount: prompts.length,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: totalUpvotes,
        },
      ],
    },
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Profile Header Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <Avatar name={author.name} src={author.avatarUrl} size="xl" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                {author.name}
              </h1>
              <p className="mt-1 text-sm font-medium text-ink-muted">@{author.handle}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-line pt-4 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
            <div className="text-center sm:text-left">
              <span className="flex items-center justify-center gap-1 text-xs text-ink-muted sm:justify-start">
                <FileText className="size-3.5" />
                Prompts
              </span>
              <p className="mt-1 text-lg font-bold tabular-nums text-ink">
                {formatCount(prompts.length)}
              </p>
            </div>

            <div className="text-center sm:text-left">
              <span className="flex items-center justify-center gap-1 text-xs text-ink-muted sm:justify-start">
                <Users className="size-3.5" />
                ยอดอ่าน
              </span>
              <p className="mt-1 text-lg font-bold tabular-nums text-ink">
                {formatCount(totalViews)}
              </p>
            </div>

            <div className="text-center sm:text-left">
              <span className="flex items-center justify-center gap-1 text-xs text-ink-muted sm:justify-start">
                <ArrowBigUp className="size-3.5" />
                โหวต
              </span>
              <p className="mt-1 text-lg font-bold tabular-nums text-accent-hover">
                {formatCount(totalUpvotes)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Prompts by this author */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-ink">
          ผลงาน Prompt ({prompts.length})
        </h2>

        {visible.length > 0 ? (
          <>
            <FeaturedGrid prompts={visible} />
            <Pagination page={page} totalPages={totalPages} basePath={`/u/${author.handle}`} />
          </>
        ) : (
          <div className="rounded-card border border-dashed border-line-strong py-16 text-center">
            <p className="text-sm font-medium text-ink">ยังไม่มีผลงานที่เผยแพร่</p>
            <p className="mt-1 text-xs text-ink-muted">ผู้ใช้คนนี้ยังไม่ได้ส่ง prompt ลงในระบบ</p>
          </div>
        )}
      </section>
    </div>
  );
}
