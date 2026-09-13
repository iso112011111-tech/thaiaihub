import { CommunityCta } from "@/components/rail/CommunityCta";
import { TopContributors } from "@/components/rail/TopContributors";
import { TrendingList } from "@/components/rail/TrendingList";
import { getTopContributors, getTrending } from "@/data/community";

/**
 * Server component: fetches its own rail data so pages never have to.
 * Rendered once by the root layout and shared across every route.
 */
export async function RightRail() {
  const [trending, contributors] = await Promise.all([
    getTrending(5),
    getTopContributors(5),
  ]);

  return (
    <div className="space-y-4">
      <TrendingList items={trending} />
      <TopContributors authors={contributors} />
      <CommunityCta />
    </div>
  );
}
