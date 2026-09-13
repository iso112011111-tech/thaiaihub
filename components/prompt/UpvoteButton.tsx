"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowBigUp } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn, formatCount } from "@/lib/utils";

/**
 * Persisted upvote. The count updates optimistically, then reconciles with the
 * number the server returns — the API is the authority, not this component.
 */
export function UpvoteButton({
  promptId,
  count,
  className,
}: {
  promptId: string;
  count: number;
  className?: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [voted, setVoted] = useState(false);
  const [total, setTotal] = useState(count);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  // Restore this user's previous vote so the button is not lying on load.
  useEffect(() => {
    if (!user) {
      setVoted(false);
      return;
    }
    let cancelled = false;
    user.getIdToken().then(async (token) => {
      const data = await fetch(`/api/prompts/${promptId}/vote`, {
        headers: { authorization: `Bearer ${token}` },
      }).then((response) => response.json());
      if (!cancelled) setVoted(Boolean(data.voted));
    }).catch(() => {
      // A failed check leaves the button neutral; voting itself still works.
    });
    return () => {
      cancelled = true;
    };
  }, [user, promptId]);

  async function toggle() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (busy) return;
    setNotice("");

    // The API refuses unverified accounts; say why instead of flickering the count.
    if (!user.emailVerified) {
      setNotice("ยืนยันอีเมลก่อนโหวต");
      return;
    }

    setBusy(true);
    const previous = { voted, total };
    setVoted(!voted);
    setTotal(total + (voted ? -1 : 1));

    try {
      const response = await fetch(`/api/prompts/${promptId}/vote`, {
        method: "POST",
        headers: { authorization: `Bearer ${await user.getIdToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "โหวตไม่สำเร็จ");
      setVoted(data.voted);
      setTotal(data.upvotes);
    } catch (error) {
      setVoted(previous.voted);
      setTotal(previous.total);
      setNotice(error instanceof Error ? error.message : "โหวตไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={voted}
        aria-label={voted ? "ยกเลิกโหวต" : "โหวตให้ prompt นี้"}
        className={cn(
          "inline-flex items-center gap-1 rounded-pill border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-60",
          voted
            ? "border-accent-ring bg-accent-soft text-accent-hover"
            : "border-line bg-surface text-ink-muted hover:border-accent-ring hover:text-accent-hover",
          className,
        )}
      >
        <ArrowBigUp className={cn("size-4", voted && "fill-current")} strokeWidth={2} />
        {formatCount(total)}
      </button>
      {notice ? (
        <span role="status" className="text-xs text-flame">
          {notice}
        </span>
      ) : null}
    </>
  );
}
