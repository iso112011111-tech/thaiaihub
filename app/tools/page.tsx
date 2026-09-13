import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getAiTools, TOOL_CATEGORIES } from "@/data/tools";
import { safeImageSrc } from "@/lib/images/safe-src";
import { initials } from "@/lib/utils";
import type { AiTool } from "@/types";

export const metadata: Metadata = { title: "เครื่องมือ AI" };

const PRICING_LABEL: Record<AiTool["pricing"], string> = {
  free: "ฟรี",
  freemium: "ใช้ฟรีได้ มีแบบเสียเงิน",
  paid: "เสียเงิน",
};

/** Logos keep their own shape and colours: contained on white, never cropped. */
function ToolLogo({ tool }: { tool: AiTool }) {
  const src = safeImageSrc(tool.logoUrl);
  return (
    <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-line bg-white">
      {src ? (
        <Image
          src={src}
          alt={`โลโก้ ${tool.name}`}
          width={44}
          height={44}
          className="size-full object-contain p-1.5"
        />
      ) : (
        <span className="text-sm font-semibold text-accent-hover">{initials(tool.name)}</span>
      )}
    </span>
  );
}

export default async function ToolsPage() {
  const tools = await getAiTools();
  // Listed categories first, in their set order; anything unlisted goes last.
  const groups = [
    ...TOOL_CATEGORIES,
    ...new Set(tools.map((tool) => tool.category).filter((c) => !TOOL_CATEGORIES.includes(c))),
  ]
    .map((category) => ({ category, items: tools.filter((tool) => tool.category === category) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-ink">เครื่องมือ AI</h1>
        <p className="mt-1 text-sm text-ink-muted">
          เครื่องมือ AI ยอดนิยม {tools.length} ตัว แยกตามประเภท พร้อมรูปแบบการคิดราคา
        </p>
      </header>

      {groups.map(({ category, items }) => (
        <section key={category} className="space-y-3">
          <h2 className="text-sm font-semibold text-ink">
            {category} <span className="font-normal text-ink-muted">({items.length})</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((tool) => (
              <Card key={tool.id} className="flex flex-col p-4 transition-colors hover:border-line-strong">
                <div className="flex items-start gap-3">
                  <ToolLogo tool={tool} />
                  <div className="min-w-0 flex-1">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm font-semibold text-ink transition-colors hover:text-accent-hover"
                    >
                      {tool.name}
                    </a>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">{tool.description}</p>
                  </div>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`เปิด ${tool.name} (หน้าต่างใหม่)`}
                    className="text-ink-muted transition-colors hover:text-accent"
                  >
                    <ArrowUpRight className="size-4" />
                  </a>
                </div>
                <div className="mt-3">
                  <Badge tone={tool.pricing === "paid" ? "neutral" : "electric"}>
                    {PRICING_LABEL[tool.pricing]}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}

      <p className="text-[11px] leading-relaxed text-ink-muted">
        ราคาและเงื่อนไขการใช้งานอาจเปลี่ยนแปลงได้ โปรดตรวจสอบที่เว็บไซต์ของผู้ให้บริการ
        ชื่อและโลโก้เป็นเครื่องหมายการค้าของเจ้าของแต่ละราย ใช้เพื่อระบุเครื่องมือเท่านั้น
      </p>
    </div>
  );
}
