import { PromptCardSkeleton } from "@/components/prompt/PromptCardSkeleton";

/**
 * Skeleton while search results load. It lives here rather than at the app root
 * on purpose: a root loading boundary starts streaming every page before it
 * renders, so a prompt page calling notFound() would still answer HTTP 200 and
 * search engines would index "not found" pages as real ones.
 */
export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="h-[340px] animate-pulse rounded-card bg-surface-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <PromptCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
