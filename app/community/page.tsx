import type { Metadata } from "next";
import { MessagesSquare, Sparkles, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "ชุมชน" };

const pillars = [
  {
    icon: Users,
    title: "แลกเปลี่ยนกับผู้ใช้จริง",
    body: "พูดคุยกับนักการตลาด นักออกแบบ และนักพัฒนาที่ใช้ AI ทุกวัน",
  },
  {
    icon: MessagesSquare,
    title: "ขอคำแนะนำเรื่อง Prompt",
    body: "โพสต์ prompt ที่ยังไม่ได้ผล แล้วให้ชุมชนช่วยปรับให้ดีขึ้น",
  },
  {
    icon: Sparkles,
    title: "อัปเดตเครื่องมือใหม่",
    body: "สรุปเครื่องมือและฟีเจอร์ใหม่ทุกสัปดาห์ คัดเฉพาะที่ใช้ได้จริง",
  },
];

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-ink">ชุมชน</h1>
        <p className="mt-1 text-sm text-ink-muted">
          พื้นที่สำหรับคนที่อยากใช้ AI ให้เกิดผลลัพธ์จริง
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {pillars.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="p-5">
            <span className="inline-flex size-9 items-center justify-center rounded-field bg-accent-soft">
              <Icon className="size-4 text-accent" strokeWidth={2.2} />
            </span>
            <h2 className="mt-3 text-sm font-semibold text-ink">{title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
