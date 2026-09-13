import type { ReactNode } from "react";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { AiLauncher } from "./AiLauncher";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * Two-column application frame: navigation rail and content.
 * The sidebar collapses into the topbar drawer below `lg`.
 * The footer spans both columns so it sits centred on the page, not the content.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Topbar />
      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 sm:px-6 lg:grid-cols-[236px_minmax(0,1fr)]">
        <Sidebar />
        <main className="min-w-0 py-6">
          <EmailVerificationBanner />
          {children}
        </main>
      </div>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <Footer />
      </div>
      <AiLauncher />
    </div>
  );
}
