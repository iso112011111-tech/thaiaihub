"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { ChatPanel } from "./ChatPanel";
import { SharkMark } from "./SharkMark";

/**
 * Floating AI THAI BOT launcher, pinned bottom-right on every page.
 * The ripples are absolutely positioned siblings, so the button's hit area
 * stays the size of the visible teal disc.
 */
export function AiLauncher() {
  const [open, setOpen] = useState(false);
  // The pop-in only plays after a chat has been closed, not on first page load.
  const [hasOpened, setHasOpened] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      {open && <ChatPanel onClose={close} />}
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setHasOpened(true);
        }}
        aria-label="เปิดแชท AI THAI BOT"
        aria-expanded={open}
        // While the chat is open the disc has bounced away; the panel's own
        // close button takes over, so keep this one out of reach.
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        className={cn(
          "group fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 sm:right-8 sm:bottom-8",
          open
            ? "pointer-events-none motion-safe:animate-pop-out motion-reduce:invisible"
            : hasOpened && "motion-safe:animate-pop-in",
        )}
      >
        {/* Two staggered ripples so a new wave leaves before the last one fades.
            Skipped for reduced-motion visitors. */}
        {!open && (
          <>
            <span aria-hidden="true" className="absolute inset-0 rounded-full bg-accent/40 motion-safe:animate-ripple motion-reduce:hidden" />
            <span aria-hidden="true" className="absolute inset-0 rounded-full bg-accent/40 motion-safe:animate-ripple motion-reduce:hidden [animation-delay:0.6s]" />
          </>
        )}
        <span className="relative flex size-14 items-center justify-center overflow-visible rounded-full bg-gradient-to-br from-accent to-accent-hover shadow-[0_10px_24px_-6px_rgb(5_158_139/0.55)] transition-transform duration-200 group-hover:scale-105 group-active:scale-95 sm:size-[60px]">
          {/* Faint diamond lattice, echoing the brand's patterned teal backdrop. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full opacity-25 [background-image:repeating-linear-gradient(45deg,rgb(255_255_255/0.5)_0_1px,transparent_1px_7px),repeating-linear-gradient(-45deg,rgb(255_255_255/0.5)_0_1px,transparent_1px_7px)]"
          />
          <SharkMark className="relative size-8 drop-shadow-[0_2px_3px_rgb(0_60_52/0.35)] sm:size-[34px]" />
          <span className="absolute -top-1 -right-1.5 flex size-5 items-center justify-center rounded-full bg-ink text-[9px] leading-none font-semibold text-white ring-2 ring-surface">
            AI
          </span>
        </span>
      </button>
    </>
  );
}
