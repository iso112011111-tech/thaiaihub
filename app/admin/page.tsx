import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "จัดการ Prompt",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-ink">จัดการ Prompt</h1>
        <p className="mt-1 text-sm text-ink-muted">
          ตรวจ prompt ที่ถูกรายงาน ซ่อนสิ่งที่ไม่เหมาะสม หรือลบถาวร
        </p>
      </header>

      <AdminDashboard />
    </div>
  );
}
