# ขึ้นเว็บบน Vercel

เช็กลิสต์สิ่งที่ต้องตั้งค่านอกโค้ด ทำครั้งแรกตามลำดับ

## 1. Environment Variables

ตั้งที่ Vercel → Project → Settings → Environment Variables

| ตัวแปร | ใช้ทำอะไร |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` (7 ตัว) | ค่าเชื่อม Firebase ฝั่งเบราว์เซอร์ คัดลอกจาก `.env.local` |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Admin SDK — Vercel ไม่มีไฟล์ `secrets/` ให้คัดลอกค่าจากไฟล์ service account มาใส่แทน `FIREBASE_SERVICE_ACCOUNT_PATH` |
| `AI_BASE_URL`, `AI_API_KEY` | AI THAI BOT ผ่านบริการ maxplus-ai (โมเดล `gemini-2.5-flash` กำหนดไว้ในโค้ด) |
| `ADMIN_EMAILS` | อีเมลผู้ดูแลที่เข้าหน้า `/admin` ได้ คั่นด้วยจุลภาค ต้องเป็นอีเมลที่ยืนยันแล้ว |

ค่าที่ขึ้นต้นด้วย `NEXT_PUBLIC_` จะถูกส่งไปเบราว์เซอร์ ห้ามใส่ความลับในชื่อแบบนี้

## 2. Firestore Security Rules

Firebase Console → Firestore Database → Rules → วางเนื้อหา `firestore.rules` ทั้งไฟล์ → Publish

แก้ไฟล์ในโปรเจกต์อย่างเดียวไม่มีผลกับฐานข้อมูลจริง ต้อง Publish ทุกครั้งที่ไฟล์นี้เปลี่ยน

## 3. จองชื่อผู้ใช้เดิม (ครั้งเดียว)

หลัง Publish rules แล้ว รันบนเครื่องที่มี `.env.local` และไฟล์ service account:

```
npm run backfill:handles
```

ถ้าไม่รัน สมาชิกใหม่อาจสมัครด้วยชื่อผู้ใช้ที่สมาชิกเก่าใช้อยู่แล้วได้

## 4. โดเมนสำหรับล็อกอิน

Firebase Console → Authentication → Settings → Authorized domains → เพิ่มโดเมนของ Vercel (เช่น `your-app.vercel.app` และโดเมนจริง)

## 5. กันยิงคำขอถี่ๆ (Vercel Firewall)

โค้ดมีตัวจำกัดความถี่อยู่แล้ว แต่นับแยกต่อเซิร์ฟเวอร์แต่ละตัว บน Vercel ที่เปิดหลายตัวพร้อมกันจึงควรตั้งที่ Firewall ด้วย ซึ่งนับรวมทั้งระบบและบล็อกก่อนถึงโค้ด

Vercel → Project → Firewall → เพิ่ม Custom Rule แบบ Rate Limit ต่อ IP:

| Path | ค่าที่แนะนำ | เหตุผล |
|---|---|---|
| `/api/chat` | 20 ครั้ง / นาที | ทุกคำถามใช้เครดิต AI |
| `/api/prompts/*/view` | 60 ครั้ง / นาที | กันปั๊มยอดวิว |
| `/api/prompts/*/report` | 10 ครั้ง / 10 นาที | กันสแปมรายงาน |

ฟีเจอร์และจำนวนกฎที่ใช้ได้ขึ้นกับแพ็กเกจของ Vercel ให้ดูในหน้า Firewall ของโปรเจกต์

ถ้าโดนยิงหนัก เปิด Attack Challenge Mode ในหน้า Firewall ได้ทันที

## 6. ความลับที่เคยหลุด

API key ที่เคยพิมพ์ในแชทหรือส่งต่อที่อื่น (ทั้ง key ของ maxplus-ai และ Google AI Studio เดิม) ให้สร้างใหม่แล้วยกเลิกอันเก่า ก่อนใส่ใน Vercel
