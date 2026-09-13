"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

/** Interactive 1-5 star control plus the current average. */
export function RatingStars({
  promptId,
  initialRating,
  initialCount,
}: {
  promptId: string;
  initialRating: number;
  initialCount: number;
}) {
  const { user } = useAuth();
  const [average, setAverage] = useState(initialRating);
  const [count, setCount] = useState(initialCount);
  const [mine, setMine] = useState(0);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill the stars with whatever this user voted before.
  useEffect(() => {
    if (!user) {
      setMine(0);
      return;
    }
    let cancelled = false;
    user.getIdToken().then(async (token) => {
      const response = await fetch(`/api/prompts/${promptId}/rate`, {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!cancelled) setMine(data.yourRating ?? 0);
    }).catch(() => {
      // A failed check just leaves the stars empty; rating still works.
    });
    return () => {
      cancelled = true;
    };
  }, [user, promptId]);

  async function rate(value: number) {
    if (!user || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/prompts/${promptId}/rate`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${await user.getIdToken()}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "ให้คะแนนไม่สำเร็จ");
      setAverage(data.rating);
      setCount(data.ratingCount);
      setMine(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ให้คะแนนไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  const filled = hover || mine;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHover(0)}
        role="radiogroup"
        aria-label="ให้คะแนน prompt นี้"
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={mine === value}
            aria-label={`${value} ดาว`}
            disabled={!user || busy}
            onMouseEnter={() => setHover(value)}
            onClick={() => rate(value)}
            className={cn(
              "p-0.5 transition-transform",
              user ? "hover:scale-110" : "cursor-not-allowed",
            )}
          >
            <Star
              className={cn(
                "size-5 transition-colors",
                value <= filled ? "fill-[#f4b942] text-[#f4b942]" : "text-line-strong",
              )}
              strokeWidth={1.8}
            />
          </button>
        ))}
      </div>

      <span className="text-sm font-semibold tabular-nums text-ink">
        {average.toFixed(1)}
      </span>
      <span className="text-xs text-ink-muted">
        {count > 0 ? `จาก ${count} คะแนน` : "ยังไม่มีใครให้คะแนน"}
      </span>

      {!user ? (
        <Link
          href="/login"
          className="text-xs font-medium text-accent-hover transition-colors hover:text-accent"
        >
          เข้าสู่ระบบเพื่อให้คะแนน
        </Link>
      ) : null}

      {error ? <span className="text-xs text-flame">{error}</span> : null}
    </div>
  );
}
