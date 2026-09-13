import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Single conversion block at the foot of the rail. */
export function CommunityCta() {
  return (
    <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-[#0b2b46] via-[#0d5a70] to-[#07b8a2] p-5">
      <div
        aria-hidden
        className="absolute -right-10 -top-10 size-32 rounded-full bg-white/10 blur-2xl"
      />
      <p className="relative text-[15px] font-semibold leading-snug text-white">
        ร่วมเป็นส่วนหนึ่ง
        <br />
        ของชุมชน AI
      </p>
      <p className="relative mt-2 text-pretty text-xs leading-relaxed text-white/70">
        แชร์ prompt สร้างสรรค์ และรับแรงบันดาลใจจากผู้ใช้คนอื่น
      </p>
      <Link
        href="/community"
        className="relative mt-4 inline-flex items-center gap-1.5 rounded-pill bg-white px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-white/90"
      >
        เข้าร่วมเลย
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
