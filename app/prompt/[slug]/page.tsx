import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { CopyButton } from "@/components/prompt/CopyButton";
import { OwnerActions } from "@/components/prompt/OwnerActions";
import { ReportButton } from "@/components/prompt/ReportButton";
import { RatingStars } from "@/components/prompt/RatingStars";
import { ViewCounter } from "@/components/prompt/ViewCounter";
import { CoverArt } from "@/components/prompt/CoverArt";
import { UpvoteButton } from "@/components/prompt/UpvoteButton";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { categoryLabel } from "@/lib/constants";
import { getPromptBySlug, getPromptImages } from "@/data/prompts";
import { formatCount } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  return {
    title: prompt?.title ?? "ไม่พบ Prompt",
    description: prompt?.excerpt,
  };
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  if (!prompt) notFound();

  const gallery = await getPromptImages(prompt.id);

  return (
    <article className="space-y-5">
      <ViewCounter promptId={prompt.id} />

      <OwnerActions
        promptId={prompt.id}
        slug={prompt.slug}
        authorId={prompt.author.id}
      />

      <CoverArt
        seed={prompt.id}
        label={categoryLabel(prompt.category)}
        src={prompt.coverUrl}
        className="aspect-[21/8] w-full rounded-card"
      />

      <header>
        <Badge tone="accent">{categoryLabel(prompt.category)}</Badge>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">
          {prompt.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{prompt.excerpt}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Avatar name={prompt.author.name} src={prompt.author.avatarUrl} />
          {prompt.author.handle ? (
            <Link
              href={`/u/${prompt.author.handle}`}
              className="text-[13px] font-medium text-ink-soft transition-colors hover:text-accent-hover"
            >
              {prompt.author.name}
            </Link>
          ) : (
            <span className="text-[13px] font-medium text-ink-soft">{prompt.author.name}</span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
            <Users className="size-3.5" />
            {formatCount(prompt.views)} คนอ่าน
          </span>
          <UpvoteButton promptId={prompt.id} count={prompt.upvotes} />
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <RatingStars
            promptId={prompt.id}
            initialRating={prompt.rating}
            initialCount={prompt.ratingCount}
          />
        </div>
      </header>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Prompt
          </span>
          <div className="w-44">
            <CopyButton text={prompt.body} label="คัดลอก" />
          </div>
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap p-4 font-mono text-[13px] leading-relaxed text-ink-soft">
          {prompt.body}
        </pre>
      </Card>

      {gallery.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">ภาพประกอบ</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((dataUri, index) => (
              <div
                key={index}
                className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-surface-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- data URI */}
                <img
                  src={dataUri}
                  alt={`ภาพประกอบที่ ${index + 1}`}
                  className="size-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {prompt.tags.map((tag) => (
          <Badge key={tag}>#{tag}</Badge>
        ))}
      </div>

      <ReportButton promptId={prompt.id} authorId={prompt.author.id} />
    </article>
  );
}
