import { SITE_NAME } from "@/lib/constants";

/** Quiet sign-off under every page's content column. */
export function Footer() {
  return (
    // Extra bottom room on phones so the floating AI launcher never covers the text.
    <footer className="mt-10 border-t border-line pt-8 pb-28 text-center sm:pb-8">
      <p className="text-xs text-ink-muted/80">แบ่งปัน prompt ดีๆ โดยชุมชนคนไทยสาย AI 🤖</p>
      <p className="mt-1.5 text-sm text-ink-muted">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </p>
    </footer>
  );
}
