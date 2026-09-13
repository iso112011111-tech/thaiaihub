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
import { categoryLabel, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getPromptBySlug, getPromptImages } from "@/data/prompts";
import { formatCount } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  if (!prompt) {
    return {
      title: "ไม่พบ Prompt",
    };
  }

  const categoryName = categoryLabel(prompt.category);
  const title = `${prompt.title} — Prompt ${categoryName}`;
  const description =
    prompt.excerpt ||
    `Prompt ${prompt.title} หมวดหมู่ ${categoryName} สำหรับใช้งานกับเครื่องมือ AI คัดสรรบน Thai AI Hub`;
  const url = `${SITE_URL}/prompt/${encodeURIComponent(prompt.slug)}`;
  const images = prompt.coverUrl ? [{ url: prompt.coverUrl }] : undefined;

  return {
    title,
    description,
    keywords: [
      `Prompt ${prompt.title}`,
      `Prompt ${categoryName}`,
      ...(prompt.tags ?? []),
      "Thai AI Hub",
      "แจก Prompt ฟรี",
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "th_TH",
      publishedTime: prompt.createdAt,
      authors: [prompt.author.name],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: prompt.coverUrl ? [prompt.coverUrl] : undefined,
    },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    headline: prompt.title,
    description: prompt.excerpt,
    url: `${SITE_URL}/prompt/${encodeURIComponent(prompt.slug)}`,
    datePublished: prompt.createdAt,
    inLanguage: "th-TH",
    author: {
      "@type": "Person",
      name: prompt.author.name,
      ...(prompt.author.handle
        ? { url: `${SITE_URL}/u/${encodeURIComponent(prompt.author.handle)}` }
        : {}),
    },
    genre: categoryLabel(prompt.category),
    keywords: prompt.tags?.join(", "),
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: prompt.upvotes,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ViewAction",
        userInteractionCount: prompt.views,
      },
    ],
    ...(prompt.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: prompt.rating.toFixed(1),
            reviewCount: prompt.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <article className="space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
