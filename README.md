# Thai AI Prompt Hub

ศูนย์รวม prompt ภาษาไทย สร้างด้วย Next.js 15 (App Router), React 19, TypeScript และ Tailwind CSS v4

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run typecheck
```

## Design principles

- **No decorative characters.** ทุกไอคอนมาจาก `lucide-react` (stroke icons) — ไม่มี emoji ในโค้ดหรือเนื้อหา
- **One accent colour.** มิ้นต์/เทียล (`--color-accent`) ใช้กับ action หลักเท่านั้น; น้ำเงิน electric ใช้กับแท็กและลิงก์รอง
- **Tokens over hex.** สี รัศมี เงา และฟอนต์ ถูกประกาศครั้งเดียวใน `app/globals.css` ภายใต้ `@theme`
- **Low elevation.** พื้นหลังเทาอ่อน การ์ดขาว เส้นขอบบาง 1px แทนเงาหนัก
- **Filters are URLs.** หมวดหมู่และคำค้นอยู่ใน query string จึงแชร์ได้และไม่ต้องใช้ JavaScript

## Directory structure

```
app/                        App Router — routing, data fetching, metadata
├── layout.tsx              Root layout: fonts (Inter + Noto Sans Thai), AppShell, RightRail
├── page.tsx                Home — Hero, CategoryFilter, FeaturedGrid, PopularRow
├── globals.css             Tailwind entry + design tokens (@theme)
├── loading.tsx             Route-level skeleton
├── not-found.tsx           404
├── explore/page.tsx        Search + category filter results (reads searchParams)
├── prompt/[slug]/page.tsx  Prompt detail, generateStaticParams + generateMetadata
├── tools/page.tsx          AI tools directory
├── submit/page.tsx         Submission form (wire to a server action)
├── leaderboard/page.tsx    Contributor ranking
└── community/page.tsx      Community landing

components/
├── layout/                 Application frame (shared by every route)
│   ├── AppShell.tsx        3-column CSS grid: sidebar / main / rail
│   ├── Sidebar.tsx         Desktop left nav + contribution CTA (sticky)
│   ├── Topbar.tsx          Brand, account actions, mobile drawer  [client]
│   ├── NavList.tsx         Nav items + active state via usePathname  [client]
│   └── RightRail.tsx       Async server component; fetches its own rail data
├── home/                   Home-page sections
│   ├── Hero.tsx            Headline, search, proof-point stats
│   ├── SearchBar.tsx       Submits to /explore?q=  [client]
│   ├── CategoryFilter.tsx  Link-based filter chips (no client JS)
│   ├── FeaturedGrid.tsx    Responsive 1→4 column prompt grid
│   └── PopularRow.tsx      Dense thumbnail list for secondary sections
├── prompt/                 Everything about a single prompt
│   ├── PromptCard.tsx      Cover, title, tags, author, copy + upvote
│   ├── CopyButton.tsx      Clipboard write with success state  [client]
│   ├── UpvoteButton.tsx    Optimistic vote counter  [client]
│   ├── CoverArt.tsx        Real image, else deterministic gradient plate
│   └── PromptCardSkeleton.tsx  Loading placeholder matching the card's box
├── rail/                   Right-rail modules
│   ├── TrendingList.tsx    Ranked list by views
│   ├── TopContributors.tsx Author leaderboard preview
│   └── CommunityCta.tsx    Single conversion block
└── ui/                     Design-system primitives (no business logic)
    ├── Button.tsx  Badge.tsx  Card.tsx  Avatar.tsx  Input.tsx
    ├── SectionHeader.tsx    Title + "see all" row above each block
    └── Slot.tsx            Minimal asChild so <Link> can wear <Button> styles

lib/
├── utils.ts                cn(), formatCount(), hashToIndex(), initials()
├── constants.ts            Site name, categories, cover gradients
└── navigation.ts           Nav items + icons, single source for both navs

data/                       Mock content layer — swap for DB/API calls
├── prompts.ts              getFeaturedPrompts / getPopularPrompts / getPromptBySlug
├── community.ts            getTrending / getTopContributors
└── tools.ts                getAiTools

hooks/useCopyToClipboard.ts Clipboard write + timed "copied" flag
types/index.ts              Prompt, Author, Category, AiTool, TrendingItem

public/images/              ไฟล์ภาพทั้งหมด — covers, avatars, tools, brand
docs/images.md              คู่มือขนาด/ชื่อไฟล์/วิธีอ้างอิงภาพ
```

> `public/` ถูกเสิร์ฟสู่สาธารณะทั้งโฟลเดอร์ จึงเก็บเฉพาะไฟล์ที่ตั้งใจให้ดาวน์โหลดได้เท่านั้น
> เอกสารประกอบอยู่ใน `docs/` ไม่ใช่ `public/`

## Responsive behaviour

| Breakpoint | Layout |
| --- | --- |
| `< lg` | Single column; sidebar becomes a drawer from the topbar |
| `lg` | Sidebar (236px) + main |
| `xl` | Sidebar (236px) + main + right rail (312px) |
| `2xl` | Card grid expands to 4 columns |

## Firebase

โปรเจกต์เชื่อมกับ Firebase project `thaiai-90464` ครบทุกระบบที่ใช้งาน

| ระบบ | ใช้ทำอะไร | ไฟล์ที่เกี่ยวข้อง |
| --- | --- | --- |
| Authentication | เข้าสู่ระบบด้วยอีเมล และ Google | `components/auth/*`, `lib/firebase/errors.ts` |
| Firestore | เก็บ prompts และโปรไฟล์ผู้ใช้ | `data/prompts.ts`, `data/community.ts`, `lib/firebase/prompts.client.ts` |
| ~~Storage~~ | **ไม่ได้ใช้** เพราะต้องเปิดแผน Blaze เก็บภาพเป็น data URI ใน Firestore แทน | `lib/images/compress.ts` |
| Analytics | เก็บสถิติการใช้งาน โหลดแบบ lazy | `lib/firebase/client.ts` |

### สถาปัตยกรรม

- **ฝั่งเบราว์เซอร์** (`lib/firebase/client.ts`) ใช้กับ Auth, การอัปโหลดไฟล์ และการเขียน prompt
  ค่า config ทั้งหมดเป็น `NEXT_PUBLIC_*` ซึ่งถูกฝังในหน้าเว็บอยู่แล้ว ความปลอดภัยมาจาก Security Rules
- **ฝั่งเซิร์ฟเวอร์** (`lib/firebase/admin.ts`) ใช้ Admin SDK อ่านข้อมูลสำหรับ Server Component
  ถ้าไม่พบ service account จะไม่พังแต่จะถอยไปใช้ข้อมูลใน `data/seed.ts` แทน เว็บจึงไม่มีทางขาวทั้งหน้า

### ตั้งค่าครั้งแรก

```bash
# 1. วาง service account (ดาวน์โหลดจาก Console > Project settings > Service accounts)
#    ไว้ที่ secrets/firebase-admin.json — โฟลเดอร์นี้ถูก gitignore แล้ว

# 2. ใส่ข้อมูลตัวอย่างลง Firestore
npm run seed

# 3. deploy security rules
firebase deploy --only firestore:rules
```

### สิ่งที่ต้องเปิดใน Firebase Console

1. **Authentication > Sign-in method** เปิด Email/Password และ Google
2. **Authentication > Settings > Authorized domains** เพิ่มโดเมนที่จะใช้จริง
   ถ้าทดสอบบนมือถือผ่าน IP ในวง LAN ต้องเพิ่ม IP นั้นด้วย ไม่อย่างนั้นป๊อปอัปจะถูกปฏิเสธ
3. **Firestore** สร้าง composite index เมื่อ Console แจ้ง (การเรียงตาม `createdAt` ใช้ index อัตโนมัติอยู่แล้ว)

### Security Rules

`firestore.rules` อยู่ใน repo แล้ว หลักการคือ

- prompt อ่านได้ทุกคน แต่เขียนได้เฉพาะเจ้าของ และตอนสร้างต้องมี `upvotes = 0` กันปั่นคะแนน
- โปรไฟล์อ่านได้ทุกคน แก้ได้เฉพาะเจ้าของ ลบไม่ได้
- ทุก path ที่ไม่ได้ระบุไว้ ถูกปฏิเสธทั้งหมด

### การเก็บภาพ (ไม่ใช้ Firebase Storage)

Firebase Storage บังคับให้เปิดแผน Blaze จึงเก็บภาพไว้ใน Firestore เป็น **data URI** แทน

ข้อจำกัดที่ต้องเคารพคือ Firestore จำกัดเอกสารละ **1 MiB** และ base64 ทำให้ไฟล์บวมขึ้น 33%
ภาพดิบจากมือถือขนาด 3-5 MB จึงเก็บตรงๆ ไม่ได้เลย `lib/images/compress.ts` จะบีบอัดในเบราว์เซอร์
ก่อนส่งเสมอ โดยแปลงเป็น WebP แล้วไล่ลดคุณภาพลงทีละขั้นจนกว่าจะเข้าเพดาน

| ประเภท | ขนาดสูงสุด | เพดานไฟล์ | เก็บที่ |
| --- | --- | --- | --- |
| ภาพปก | 960 x 600 | 120 KB | ฟิลด์ `coverUrl` บนเอกสาร prompt |
| ภาพประกอบอื่น | 1200 x 1200 | 180 KB | subcollection `prompts/{id}/images` เอกสารละ 1 ภาพ |

เหตุผลที่แยก subcollection คือหน้ารายการต้องอ่าน prompt หลายสิบรายการพร้อมกัน
ถ้ายัดทุกภาพไว้บนเอกสารเดียว หน้าแรกจะลากข้อมูลหนักโดยไม่จำเป็น
เอกสาร prompt จึงพกแค่ภาพปก ส่วนที่เหลือหน้ารายละเอียดค่อยอ่านเพิ่ม

**ข้อแลกเปลี่ยนที่ต้องยอมรับ**

- ภาพถูกฝังลงใน HTML โดยตรง เบราว์เซอร์จึงแคชภาพแยกไม่ได้ ทุกครั้งที่โหลดหน้าใหม่ต้องโหลดภาพใหม่ทั้งหมด
- `next/image` ปรับขนาดหรือแปลงฟอร์แมตให้ไม่ได้ (ตั้ง `unoptimized` ไว้แล้วใน `CoverArt`)
- หน้าแรกที่มีการ์ด 8 ใบจะมี HTML หนักประมาณ 800 KB ถ้าภาพปกเต็มเพดาน

ค่าอ่าน Firestore ไม่น่ากังวลเพราะหน้าเว็บตั้ง `revalidate = 60` ไว้ เซิร์ฟเวอร์จึงอ่านฐานข้อมูล
อย่างมากนาทีละครั้งต่อหนึ่งหน้า ไม่ใช่ทุกครั้งที่มีคนเข้า

**เมื่อไหร่ควรย้ายออก** ถ้ามี prompt เกินสองสามร้อยรายการ หรือผู้ใช้เริ่มบ่นว่าหน้าโหลดช้า
ให้ย้ายไป Cloudflare R2 (ฟรี 10 GB) หรือ Supabase Storage (ฟรี 1 GB) แล้วเก็บแค่ URL ใน Firestore
แก้เฉพาะ `lib/firebase/prompts.client.ts` ส่วนที่เรียก `compressToDataUri`

## Next steps

1. Replace `data/*` with your database client (Prisma/Drizzle) — the async function signatures already match.
2. Add `app/submit/actions.ts` with a `"use server"` action and pass it to the form's `action`.
3. Turn `UpvoteButton`'s local state into a server action with `useOptimistic`.
4. Add auth (`app/(auth)/`) and swap the placeholder avatar in `Topbar`.
