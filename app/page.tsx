import Link from "next/link";
import { Flame, Star } from "lucide-react";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { Hero } from "@/components/home/Hero";
import { PopularRow } from "@/components/home/PopularRow";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAllPrompts, getFeaturedPrompts, getPopularPrompts } from "@/data/prompts";
import { getAiTools } from "@/data/tools";

// Content lives in Firestore, so this page must not be frozen at build time.
export const revalidate = 60;

export default async function HomePage() {
  const [all, featured, popular, tools] = await Promise.all([
    getAllPrompts(),
    getFeaturedPrompts(6),
    getPopularPrompts(4),
    getAiTools(),
  ]);

  const stats = {
    prompts: all.length,
    contributors: new Set(all.map((prompt) => prompt.author.id).filter(Boolean)).size,
    tools: tools.length,
  };

  return (
    <div className="space-y-8">
      <Hero stats={stats} />
      <CategoryFilter />

      {featured.length === 0 ? (
        <section className="rounded-card border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="text-base font-semibold text-ink">ยังไม่มี prompt ในระบบ</p>
          <p className="mt-1 text-sm text-ink-muted">มาเป็นคนแรกที่แบ่งปัน prompt ดีๆ ให้ชุมชน</p>
          <Button asChild className="mt-5">
            <Link href="/submit">ส่ง Prompt แรก</Link>
          </Button>
        </section>
      ) : (
        <>
          <section>
            <SectionHeader title="Prompt แนะนำ" icon={Star} href="/explore" />
            <FeaturedGrid prompts={featured} />
          </section>

          <section>
            <SectionHeader title="ยอดนิยม" icon={Flame} href="/explore?sort=popular" />
            <PopularRow prompts={popular} />
          </section>
        </>
      )}
    </div>
  );
}
