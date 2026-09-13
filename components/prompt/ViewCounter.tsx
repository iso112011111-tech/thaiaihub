"use client";

import { useEffect } from "react";

const WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Registers one view per prompt per browser per 24 hours.
 *
 * Rendered invisibly on the detail page. Deduplication lives in localStorage so
 * a reader refreshing the page ten times still counts once — enough for a
 * community leaderboard, not a substitute for real analytics.
 */
export function ViewCounter({ promptId }: { promptId: string }) {
  useEffect(() => {
    const key = `viewed:${promptId}`;
    try {
      const last = Number(localStorage.getItem(key) ?? 0);
      if (Date.now() - last < WINDOW_MS) return;
      localStorage.setItem(key, String(Date.now()));
    } catch {
      // Private mode blocks storage; counting every visit is better than none.
    }

    void fetch(`/api/prompts/${promptId}/view`, { method: "POST" });
  }, [promptId]);

  return null;
}
