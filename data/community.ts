import "server-only";

import { getAllPrompts } from "./prompts";
import type { Author } from "@/types";

/**
 * Contributors ranked by how many prompts they have published, then by the
 * upvotes those prompts earned.
 *
 * Counted from the prompts themselves rather than a `promptCount` field on the
 * profile: profiles are written from the browser, so a stored counter could be
 * edited to top the leaderboard.
 */
export async function getTopContributors(limit = 5): Promise<Author[]> {
  const tally = new Map<string, { author: Author; prompts: number; upvotes: number }>();

  for (const prompt of await getAllPrompts()) {
    if (!prompt.author.id) continue;
    const entry = tally.get(prompt.author.id) ?? { author: prompt.author, prompts: 0, upvotes: 0 };
    entry.prompts += 1;
    entry.upvotes += prompt.upvotes;
    tally.set(prompt.author.id, entry);
  }

  return [...tally.values()]
    .sort((a, b) => b.prompts - a.prompts || b.upvotes - a.upvotes)
    .slice(0, limit)
    .map(({ author, prompts }) => ({ ...author, promptCount: prompts }));
}
