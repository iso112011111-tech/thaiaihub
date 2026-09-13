"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCheck, Eye, EyeOff, ShieldAlert, Trash2 } from "lucide-react";
import type { AdminPromptItem } from "@/app/api/admin/prompts/route";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { reportReasonLabel } from "@/lib/moderation";
import { cn } from "@/lib/utils";

const VIEWS = [
  { id: "reported", label: "ถูกรายงาน" },
  { id: "hidden", label: "ซ่อนอยู่" },
  { id: "recent", label: "ล่าสุด" },
] as const;

type View = (typeof VIEWS)[number]["id"];
type Action = "hide" | "publish" | "dismiss" | "delete";

const pill = "inline-flex items-center rounded-pill px-2 py-0.5 text-[11px] font-medium";

export function AdminDashboard() {
  const { user, loading } = useAuth();
  const { admin, checked } = useIsAdmin();
  const [view, setView] = useState<View>("reported");
  const [items, setItems] = useState<AdminPromptItem[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setItems(null);
    setError("");
    try {
      const response = await fetch(`/api/admin/prompts?view=${view}`, {
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "โหลดรายการไม่สำเร็จ");
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดรายการไม่สำเร็จ");
      setItems([]);
    }
  }, [user, view]);

  useEffect(() => {
    if (admin) void load();
  }, [admin, load]);

  async function act(item: AdminPromptItem, action: Action) {
    if (!user) return;
    setBusyId(item.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/prompts/${item.id}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: {
          authorization: `Bearer ${await user.getIdToken()}`,
          "content-type": "application/json",
        },
        body: action === "delete" ? undefined : JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "ทำรายการไม่สำเร็จ");
      setConfirmingDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ทำรายการไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  }

  if (loading || (user && !checked)) {
    return <Card className="h-64 animate-pulse bg-surface-muted" />;
  }

  if (!user || !admin) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-muted">
          <ShieldAlert className="size-5 text-ink-muted" strokeWidth={2} />
        </span>
        <p className="text-sm font-semibold text-ink">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
        {!user ? (
          <Button asChild className="mt-1">
            <Link href="/login">เข้าสู่ระบบ</Link>
          </Button>
        ) : null}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="มุมมอง">
        {VIEWS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={view === option.id}
            onClick={() => setView(option.id)}
            className={cn(
              "rounded-pill border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              view === option.id
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-ink-soft hover:border-accent-ring hover:text-accent-hover",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-xs text-flame">{error}</p> : null}

      {items === null ? (
        <Card className="h-40 animate-pulse bg-surface-muted" />
      ) : items.length === 0 ? (
        <Card className="py-12 text-center text-sm text-ink-muted">ไม่มีรายการในมุมมองนี้</Card>
      ) : (
        <Card className="divide-y divide-line">
          {items.map((item) => {
            const busy = busyId === item.id;
            return (
              <div key={item.id} className="space-y-2.5 p-4">
                <div className="flex flex-wrap items-start gap-2">
                  <div className="min-w-0 flex-1">
                    {item.status === "hidden" ? (
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                    ) : (
                      <Link
                        href={`/prompt/${item.slug}`}
                        className="text-sm font-semibold text-ink transition-colors hover:text-accent-hover"
                      >
                        {item.title}
                      </Link>
                    )}
                    <p className="mt-0.5 text-xs text-ink-muted">
                      โดย {item.authorName}
                      {item.createdAt
                        ? ` · ${new Date(item.createdAt).toLocaleDateString("th-TH")}`
                        : ""}
                    </p>
                  </div>
                  {item.status === "hidden" ? (
                    <span className={cn(pill, "bg-surface-muted text-ink-soft")}>ซ่อนอยู่</span>
                  ) : null}
                  {item.reportCount > 0 ? (
                    <span className={cn(pill, "bg-flame/10 text-flame")}>
                      รายงาน {item.reportCount}
                    </span>
                  ) : null}
                </div>

                {item.reports.length > 0 ? (
                  <ul className="space-y-1 text-xs text-ink-soft">
                    {item.reports.map((report, index) => (
                      <li key={index}>
                        • {reportReasonLabel(report.reason)}
                        {report.note ? `: ${report.note}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {item.status === "hidden" ? (
                    <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => act(item, "publish")}>
                      <Eye className="size-4" />
                      แสดงอีกครั้ง
                    </Button>
                  ) : (
                    <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => act(item, "hide")}>
                      <EyeOff className="size-4" />
                      ซ่อน
                    </Button>
                  )}

                  {item.reportCount > 0 ? (
                    <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => act(item, "dismiss")}>
                      <CheckCheck className="size-4" />
                      ยกเลิกรายงาน
                    </Button>
                  ) : null}

                  {confirmingDelete === item.id ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        disabled={busy}
                        onClick={() => act(item, "delete")}
                        className="bg-flame hover:bg-flame/90"
                      >
                        {busy ? "กำลังลบ..." : "ยืนยันลบถาวร"}
                      </Button>
                      <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setConfirmingDelete(null)}>
                        ยกเลิก
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => setConfirmingDelete(item.id)}
                      className="text-flame hover:bg-flame/10 hover:text-flame"
                    >
                      <Trash2 className="size-4" />
                      ลบ
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
