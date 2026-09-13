"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

/** Edit and delete controls, rendered only for the prompt's own author. */
export function OwnerActions({
  promptId,
  slug,
  authorId,
}: {
  promptId: string;
  slug: string;
  authorId: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.uid !== authorId) return null;

  async function remove() {
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "ลบไม่สำเร็จ");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface-muted p-3.5">
      {confirming ? (
        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-ink">ลบ prompt นี้ถาวร</p>
          <p className="text-xs leading-relaxed text-ink-muted">
            ภาพประกอบ คะแนน และโหวตทั้งหมดจะถูกลบไปด้วย กู้คืนไม่ได้
          </p>
          {error ? <p className="text-xs text-flame">{error}</p> : null}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirming(false)}
              disabled={busy}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={remove}
              disabled={busy}
              className="bg-flame hover:bg-flame/90"
            >
              {busy ? "กำลังลบ..." : "ยืนยันการลบ"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-auto text-xs text-ink-muted">
            คุณเป็นเจ้าของ prompt นี้
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href={`/prompt/${slug}/edit`}>
              <Pencil className="size-4" />
              แก้ไข
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(true)}
            className="text-flame hover:bg-flame/10 hover:text-flame"
          >
            <Trash2 className="size-4" />
            ลบ
          </Button>
        </div>
      )}
    </div>
  );
}
