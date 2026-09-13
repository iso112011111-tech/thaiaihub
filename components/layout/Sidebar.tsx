import Link from "next/link";
import { Sparkles } from "lucide-react";
import { NavList } from "./NavList";
import { Button } from "@/components/ui/Button";

/**
 * Desktop left rail: primary navigation plus a single contribution CTA.
 * Sticky under the topbar so navigation is always one click away.
 */
export function Sidebar() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[68px] flex max-h-[calc(100dvh-84px)] flex-col gap-6 overflow-y-auto py-6 pr-2">
        <NavList />

        <div className="rounded-card border border-line bg-surface p-4">
          <span className="inline-flex size-8 items-center justify-center rounded-field bg-accent-soft">
            <Sparkles className="size-4 text-accent" strokeWidth={2.2} />
          </span>
          <p className="mt-3 text-sm font-semibold leading-snug text-ink">
            สร้างสรรค์ไปกับ AI
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            แชร์ prompt ของคุณให้ชุมชนได้ใช้งาน
          </p>
          <Button asChild size="sm" className="mt-3 w-full">
            <Link href="/submit">เริ่มเลย</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
