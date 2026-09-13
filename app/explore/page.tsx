import type { Metadata } from "next";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { FeaturedGrid } from "@/components/home/FeaturedGrid";
import { SearchBar } from "@/components/home/SearchBar";
import { Pagination } from "@/components/ui/Pagination";
import { searchPrompts } from "@/data/prompts";
import type { CategoryId } from "@/types";

export const metadata: Metadata = {
  title: "สำรวจ Prompt ทั้งหมด — คลังคำสั่ง AI ภาษาไทย",
  description:
    "ค้นหาและเลือกดู Prompt AI คุณภาพสูง ทั้ง ChatGPT, Midjourney, งานเขียน, การตลาด, วิเคราะห์ข้อมูล และโค้ดโปรแกรม",
  alternates: {
    canonical: "/explore",
  },
  openGraph: {
    title: "สำรวจ Prompt ทั้งหมด — Thai AI Hub",
    description:
      "ค้นหาและเลือกดู Prompt AI คุณภาพสูง ทั้ง ChatGPT, Midjourney, งานเขียน, การตลาด, วิเคราะห์ข้อมูล และโค้ดโปรแกรม",
    url: "/explore",
  },
};

/** Three full rows on the widest 4-column grid, and an even count for 2 or 3 columns. */
const PAGE_SIZE = 12;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: CategoryId; page?: string; sort?: string }>;
}) {
  const { q = "", category = "all", page: pageParam, sort } = await searchParams;

  // Newest first by default; the home page's popular section links here with sort=popular.
  const popular = sort === "popular";
  const results = await searchPrompts({ q, category, sort: popular ? "popular" : "latest" });

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  // Out-of-range or garbage values land on the nearest real page.
  const page = Math.min(totalPages, Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1));
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-ink">สำรวจ Prompt</h1>
        <p className="mt-1 text-sm text-ink-muted">
          พบ {results.length} รายการ{q ? ` สำหรับ "${q}"` : ""}
          {popular ? " · เรียงตามยอดนิยม" : ""}
          {totalPages > 1 ? ` · หน้า ${page} จาก ${totalPages}` : ""}
        </p>
      </header>

      <SearchBar
        defaultValue={q}
        className="border border-line shadow-none"
      />
      <CategoryFilter active={category} />

      {visible.length > 0 ? (
        <>
          <FeaturedGrid prompts={visible} />
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/explore"
            params={{
              q: q || undefined,
              category: category === "all" ? undefined : category,
              sort: popular ? "popular" : undefined,
            }}
          />
        </>
      ) : (
        <div className="rounded-card border border-dashed border-line-strong py-16 text-center">
          <p className="text-sm font-medium text-ink">ไม่พบ prompt ที่ตรงกับการค้นหา</p>
          <p className="mt-1 text-xs text-ink-muted">ลองเปลี่ยนคำค้นหรือเลือกหมวดหมู่อื่น</p>
        </div>
      )}
    </div>
  );
}
