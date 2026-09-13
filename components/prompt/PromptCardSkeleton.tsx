import { Card } from "@/components/ui/Card";

/** Matches PromptCard's box model exactly so Suspense swaps cause no layout shift. */
export function PromptCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[16/10] w-full animate-pulse bg-surface-muted" />
      <div className="space-y-2 p-3.5">
        <div className="h-4 w-4/5 animate-pulse rounded bg-surface-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-surface-muted" />
        <div className="h-8 w-full animate-pulse rounded-pill bg-surface-muted" />
      </div>
    </Card>
  );
}
