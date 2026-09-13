"use client";

import Link from "next/link";
import { useState } from "react";
import { Flag } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { REPORT_REASONS } from "@/lib/moderation";
import { cn } from "@/lib/utils";

const NOTE_MAX = 300;

/** Lets readers flag a prompt for the admins. Not shown to the prompt's own author. */
export function ReportButton({ promptId, authorId }: { promptId: string; authorId: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  if (user?.uid === authorId) return null;

  if (sent) {
    return <p className="text-xs text-ink-muted">ขอบคุณที่แจ้ง ทีมงานจะตรวจสอบ prompt นี้</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-flame"
      >
        <Flag className="size-3.5" />
        รายงาน prompt นี้
      </button>
    );
  }

  if (!user) {
    return (
      <p className="text-xs text-ink-muted">
        <Link href="/login" className="font-medium text-accent-hover hover:underline">
          เข้าสู่ระบบ
        </Link>{" "}
        เพื่อรายงาน prompt
      </p>
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !reason) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/prompts/${promptId}/report`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${await user.getIdToken()}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ reason, note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "ส่งรายงานไม่สำเร็จ");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ส่งรายงานไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-card border border-line bg-surface-muted p-3.5">
      <p className="text-sm font-semibold text-ink">รายงาน prompt นี้</p>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="เหตุผลที่รายงาน">
        {REPORT_REASONS.map((option) => (
          <label
            key={option.id}
            className={cn(
              "cursor-pointer rounded-pill border px-3 py-1.5 text-xs transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-ring",
              reason === option.id
                ? "border-flame bg-flame/10 text-flame"
                : "border-line bg-surface text-ink-soft hover:border-line-strong",
            )}
          >
            <input
              type="radio"
              name="reason"
              value={option.id}
              checked={reason === option.id}
              onChange={() => setReason(option.id)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={NOTE_MAX}
        rows={2}
        placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
        className="w-full rounded-field border border-line bg-surface p-2.5 text-xs text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
      />

      {error ? <p className="text-xs text-flame">{error}</p> : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={busy}>
          ยกเลิก
        </Button>
        <Button type="submit" size="sm" disabled={busy || !reason}>
          {busy ? "กำลังส่ง..." : "ส่งรายงาน"}
        </Button>
      </div>
    </form>
  );
}
