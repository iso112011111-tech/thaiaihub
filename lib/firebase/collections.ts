/** Single source of truth for Firestore paths, shared by client and admin code. */
export const COLLECTIONS = {
  prompts: "prompts",
  users: "users",
  votes: "votes",
  /** handles/{handle} → { uid }: reserves a username so no two accounts share it. */
  handles: "handles",
  /** reports/{promptId}_{uid}: one report per reader per prompt, written by the server. */
  reports: "reports",
} as const;
