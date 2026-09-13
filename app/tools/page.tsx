import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getAiTools } from "@/data/tools";

export const metadata: Metadata = { title: "เครื่องมือ AI" };

export default async function ToolsPage() {
  const tools = await getAiTools();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-ink">เครื่องมือ AI</h1>
        <p className="mt-1 text-sm text-ink-muted">
          เครื่องมือที่ชุมชนใช้งานจริง พร้อมรูปแบบการคิดราคา
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.id} className="p-4 transition-colors hover:border-line-strong">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Avatar
                  name={tool.name}
                  src={tool.logoUrl}
                  size="lg"
                  className="rounded-[10px]"
                />
                <div>
                  <h2 className="text-sm font-semibold text-ink">{tool.name}</h2>
                  <Badge className="mt-1.5">{tool.category}</Badge>
                </div>
              </div>
              <a
                href={tool.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`เปิด ${tool.name}`}
                className="text-ink-muted transition-colors hover:text-accent"
              >
                <ArrowUpRight className="size-4" />
              </a>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              {tool.description}
            </p>
            <Badge tone="electric" className="mt-3">
              {tool.pricing}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
