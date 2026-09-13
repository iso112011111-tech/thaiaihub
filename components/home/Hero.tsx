import Image from "next/image";
import { SearchBar } from "./SearchBar";

/** Live totals, counted by the home page from the real library. */
export interface HeroStats {
  prompts: number;
  contributors: number;
  tools: number;
}

/**
 * Above-the-fold panel. The artwork keeps its own column so it never collides
 * with the copy, and the panel tint matches the illustration's background so
 * the two read as one continuous surface.
 */
export function Hero({ stats }: { stats: HeroStats }) {
  // Real numbers only. Before the first prompt exists there is nothing honest to boast about.
  const items =
    stats.prompts > 0
      ? [
          { value: stats.prompts.toLocaleString("th-TH"), label: "Prompt ในระบบ" },
          { value: stats.contributors.toLocaleString("th-TH"), label: "ผู้ร่วมแบ่งปัน" },
          { value: stats.tools.toLocaleString("th-TH"), label: "เครื่องมือ AI" },
        ]
      : [];

  return (
    <section
      className="overflow-hidden rounded-card bg-[#f4fbff] sm:bg-[linear-gradient(to_right,#ffffff_0%,#eef8fe_30%,#b3e0fd_52%)]"
    >
      <div className="grid sm:grid-cols-[minmax(0,1fr)_48%]">
        <div className="order-2 px-6 py-9 sm:order-1 sm:py-12 sm:pl-10 sm:pr-4">
          <span className="inline-flex items-center rounded-pill border border-ink/10 bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            Prompt Library
          </span>
          <h1 className="mt-4 bg-gradient-to-r from-[#0b1117] via-[#12324f] to-[#1668a8] bg-clip-text text-[28px] font-bold leading-[1.25] tracking-tight text-transparent sm:text-[34px]">
            ศูนย์รวมสูตรลับ AI
            <br className="hidden sm:block" /> ภายในไทยที่ใหญ่ที่สุด
          </h1>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-soft">
            ค้นหาไอเดียสุดเจ๋ง พร้อม prompt คุณภาพที่ผ่านการคัดเลือกจากชุมชน
            ใช้งานได้ทันทีในคลิกเดียว
          </p>

          <SearchBar className="mt-6 w-full border border-line" />

          {items.length > 0 ? (
          <dl className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            {items.map((stat, index) => (
              <div
                key={stat.label}
                className={
                  index > 0 ? "border-l border-line-strong/70 pl-6" : undefined
                }
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-lg font-semibold tracking-tight text-ink">
                  {stat.value}
                </dd>
                <p className="text-[11px] text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </dl>
          ) : null}
        </div>

        {/* Mobile: a band above the copy. Desktop: the right column, edge to edge.
            The mask dissolves the artwork's left edge into the panel, which works
            whatever the illustration's own background colour happens to be — no
            colour matching to keep in sync. */}
        <div className="relative order-1 h-[168px] w-full sm:order-2 sm:h-auto sm:[mask-image:linear-gradient(to_right,transparent_0%,#000_10%)]">
          <Image
            src="/images/brand/logo3.png"
            alt=""
            fill
            priority
            // object-cover magnifies a 3:1 banner inside a 1.3:1 box, so the
            // painted width is far wider than the box: 406px tall x 2.99 = ~1250px.
            // `sizes` must describe that painted width, not the box, or the browser
            // picks a variant roughly half the resolution it needs.
            sizes="(max-width: 639px) 150vw, 1250px"
            className="object-cover object-right sm:object-[74%_center]"
          />
        </div>
      </div>
    </section>
  );
}
