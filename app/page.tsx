import { Flame, Star } from "lucide-react";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { Hero } from "@/components/home/Hero";
import { PopularRow } from "@/components/home/PopularRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getFeaturedPrompts, getPopularPrompts } from "@/data/prompts";

// Content lives in Firestore, so this page must not be frozen at build time.
export const revalidate = 60;

export default async function HomePage() {
  const [featured, popular] = await Promise.all([
    getFeaturedPrompts(6),
    getPopularPrompts(4),
  ]);

  return (
    <div className="space-y-8">
      <Hero />
      <CategoryFilter />

      <section>
        <SectionHeader title="Prompt แนะนำ" icon={Star} href="/explore" />
        <FeaturedGrid prompts={featured} />
      </section>

      <section>
        <SectionHeader
          title="ยอดนิยมสัปดาห์นี้"
          icon={Flame}
          href="/explore?sort=popular"
        />
        <PopularRow prompts={popular} />
      </section>
    </div>
  );
}
