import { useId } from "react";

/** Placeholder brand mark for AI THAI BOT, drawn light to sit on the teal accent. */
export function SharkMark({ className }: { className?: string }) {
  // Several marks can be on screen at once; gradient ids must not collide.
  const id = useId();
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${id}-top`} x1="8" y1="28" x2="40" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d4fbf3" />
        </linearGradient>
        <linearGradient id={`${id}-jaw`} x1="12" y1="24" x2="30" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#9fe6d8" />
        </linearGradient>
      </defs>
      <path d="M8 27C16 22 26 20 34 13L40 9L37 17C33 22 24 25 14 28Z" fill={`url(#${id}-top)`} />
      <path d="M12 30C22 29 30 27 37 23L33 31C28 35 23 36 30 39C22 40 16 36 12 30Z" fill={`url(#${id}-jaw)`} />
    </svg>
  );
}
