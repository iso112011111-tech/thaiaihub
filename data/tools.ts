import type { AiTool } from "@/types";

/** Display order of the tools page sections. */
export const TOOL_CATEGORIES: string[] = [
  "แชทและผู้ช่วย AI",
  "ค้นหาและค้นคว้า",
  "สร้างภาพและออกแบบ",
  "วิดีโอ",
  "เสียงและเพลง",
  "เขียนโค้ดและสร้างเว็บ",
  "งานเอกสารและนำเสนอ",
  "ระบบอัตโนมัติ",
];

/**
 * Curated AI tools. Logos live in public/images/tools, taken from each tool's
 * official site; a tool without one shows its initials. The chat bot may link to
 * these URLs, so list each tool by its official address.
 */
export const aiTools: AiTool[] = [
  // แชทและผู้ช่วย AI
  { id: "chatgpt", name: "ChatGPT", category: "แชทและผู้ช่วย AI", url: "https://chatgpt.com", pricing: "freemium", logoUrl: "/images/tools/chatgpt.png", description: "ผู้ช่วย AI อเนกประสงค์ของ OpenAI ถามตอบ เขียนงาน วิเคราะห์ไฟล์ และสร้างภาพ" },
  { id: "claude", name: "Claude", category: "แชทและผู้ช่วย AI", url: "https://claude.ai", pricing: "freemium", logoUrl: "/images/tools/claude.png", description: "ผู้ช่วย AI ของ Anthropic เด่นเรื่องเขียนงาน วิเคราะห์เอกสารยาว และเขียนโค้ด" },
  { id: "gemini", name: "Gemini", category: "แชทและผู้ช่วย AI", url: "https://gemini.google.com", pricing: "freemium", logoUrl: "/images/tools/gemini.png", description: "ผู้ช่วย AI ของ Google ใช้ร่วมกับ Gmail, Docs และบริการอื่นของ Google ได้" },
  { id: "copilot", name: "Microsoft Copilot", category: "แชทและผู้ช่วย AI", url: "https://copilot.microsoft.com", pricing: "freemium", logoUrl: "/images/tools/copilot.jpg", description: "ผู้ช่วย AI ของ Microsoft ใช้ได้บนเว็บ Windows และแอป Microsoft 365" },
  { id: "deepseek", name: "DeepSeek", category: "แชทและผู้ช่วย AI", url: "https://chat.deepseek.com", pricing: "free", logoUrl: "/images/tools/deepseek.png", description: "ผู้ช่วย AI ที่เก่งด้านการคิดเป็นขั้นตอน คณิตศาสตร์ และโค้ด" },
  { id: "grok", name: "Grok", category: "แชทและผู้ช่วย AI", url: "https://grok.com", pricing: "freemium", logoUrl: "/images/tools/grok.png", description: "ผู้ช่วย AI ของ xAI ตอบคำถามโดยดึงข้อมูลล่าสุดจาก X และเว็บ" },
  { id: "le-chat", name: "Le Chat", category: "แชทและผู้ช่วย AI", url: "https://chat.mistral.ai", pricing: "freemium", logoUrl: "/images/tools/le-chat.png", description: "ผู้ช่วย AI ของ Mistral ตอบเร็ว ค้นเว็บและอ่านเอกสารได้" },

  // ค้นหาและค้นคว้า
  { id: "perplexity", name: "Perplexity", category: "ค้นหาและค้นคว้า", url: "https://www.perplexity.ai", pricing: "freemium", logoUrl: "/images/tools/perplexity.png", description: "ค้นหาข้อมูลด้วย AI พร้อมอ้างอิงแหล่งที่มาในทุกคำตอบ" },
  { id: "notebooklm", name: "NotebookLM", category: "ค้นหาและค้นคว้า", url: "https://notebooklm.google.com", pricing: "freemium", logoUrl: "/images/tools/notebooklm.png", description: "ใส่เอกสารของเราแล้วให้ AI สรุป ตอบคำถาม และทำเสียงสรุปเนื้อหา" },

  // สร้างภาพและออกแบบ
  { id: "midjourney", name: "Midjourney", category: "สร้างภาพและออกแบบ", url: "https://www.midjourney.com", pricing: "paid", logoUrl: "/images/tools/midjourney.png", description: "สร้างภาพศิลปะคุณภาพสูงจากคำสั่งข้อความ" },
  { id: "leonardo", name: "Leonardo AI", category: "สร้างภาพและออกแบบ", url: "https://leonardo.ai", pricing: "freemium", logoUrl: "/images/tools/leonardo.png", description: "สร้างภาพและงานออกแบบ มีสไตล์และโมเดลให้เลือกหลากหลาย" },
  { id: "ideogram", name: "Ideogram", category: "สร้างภาพและออกแบบ", url: "https://ideogram.ai", pricing: "freemium", logoUrl: "/images/tools/ideogram.png", description: "สร้างภาพที่มีตัวอักษรในภาพได้แม่นยำ เหมาะกับโปสเตอร์และโลโก้" },
  { id: "firefly", name: "Adobe Firefly", category: "สร้างภาพและออกแบบ", url: "https://firefly.adobe.com", pricing: "freemium", logoUrl: "/images/tools/firefly.png", description: "สร้างและแก้ไขภาพด้วย AI ของ Adobe ใช้ต่อใน Photoshop ได้" },
  { id: "krea", name: "Krea", category: "สร้างภาพและออกแบบ", url: "https://www.krea.ai", pricing: "freemium", logoUrl: "/images/tools/krea.png", description: "สร้างและปรับภาพแบบเห็นผลทันที พร้อมเพิ่มความละเอียดภาพ" },
  { id: "canva", name: "Canva", category: "สร้างภาพและออกแบบ", url: "https://www.canva.com", pricing: "freemium", logoUrl: "/images/tools/canva.png", description: "ออกแบบกราฟิก โพสต์ และสไลด์ มีเครื่องมือ AI ช่วยสร้างภาพและข้อความ" },

  // วิดีโอ
  { id: "runway", name: "Runway", category: "วิดีโอ", url: "https://runwayml.com", pricing: "freemium", logoUrl: "/images/tools/runway.png", description: "สร้างและตัดต่อวิดีโอด้วย AI จากข้อความหรือภาพ" },
  { id: "kling", name: "Kling AI", category: "วิดีโอ", url: "https://klingai.com", pricing: "freemium", logoUrl: "/images/tools/kling.png", description: "สร้างวิดีโอที่ดูสมจริงจากข้อความหรือภาพนิ่ง" },
  { id: "pika", name: "Pika", category: "วิดีโอ", url: "https://pika.art", pricing: "freemium", description: "สร้างวิดีโอสั้นและเอฟเฟกต์สนุกๆ จากข้อความหรือภาพ" },
  { id: "heygen", name: "HeyGen", category: "วิดีโอ", url: "https://www.heygen.com", pricing: "freemium", logoUrl: "/images/tools/heygen.png", description: "สร้างวิดีโอที่มีพรีเซนเตอร์ AI และแปลวิดีโอเป็นภาษาอื่นพร้อมขยับปาก" },
  { id: "capcut", name: "CapCut", category: "วิดีโอ", url: "https://www.capcut.com", pricing: "freemium", logoUrl: "/images/tools/capcut.png", description: "ตัดต่อวิดีโอพร้อมฟีเจอร์ AI เช่น ซับไตเติลอัตโนมัติและลบพื้นหลัง" },

  // เสียงและเพลง
  { id: "elevenlabs", name: "ElevenLabs", category: "เสียงและเพลง", url: "https://elevenlabs.io", pricing: "freemium", logoUrl: "/images/tools/elevenlabs.png", description: "แปลงข้อความเป็นเสียงพูดที่เป็นธรรมชาติ และสร้างเสียงพากย์" },
  { id: "suno", name: "Suno", category: "เสียงและเพลง", url: "https://suno.com", pricing: "freemium", logoUrl: "/images/tools/suno.png", description: "แต่งเพลงพร้อมเนื้อร้องและดนตรีจากคำอธิบายสั้นๆ" },

  // เขียนโค้ดและสร้างเว็บ
  { id: "github-copilot", name: "GitHub Copilot", category: "เขียนโค้ดและสร้างเว็บ", url: "https://github.com/features/copilot", pricing: "freemium", logoUrl: "/images/tools/github-copilot.png", description: "ผู้ช่วยเขียนโค้ดใน VS Code และ IDE ยอดนิยม" },
  { id: "cursor", name: "Cursor", category: "เขียนโค้ดและสร้างเว็บ", url: "https://cursor.com", pricing: "freemium", logoUrl: "/images/tools/cursor.png", description: "โปรแกรมเขียนโค้ดที่มี AI ช่วยเขียนและแก้โค้ดทั้งโปรเจกต์" },
  { id: "v0", name: "v0", category: "เขียนโค้ดและสร้างเว็บ", url: "https://v0.app", pricing: "freemium", logoUrl: "/images/tools/v0.png", description: "สร้างหน้าเว็บและแอปจากคำอธิบาย โดย Vercel" },
  { id: "bolt", name: "Bolt", category: "เขียนโค้ดและสร้างเว็บ", url: "https://bolt.new", pricing: "freemium", logoUrl: "/images/tools/bolt.png", description: "สร้างและรันเว็บแอปจากคำสั่ง ทำงานในเบราว์เซอร์ทั้งหมด" },
  { id: "lovable", name: "Lovable", category: "เขียนโค้ดและสร้างเว็บ", url: "https://lovable.dev", pricing: "freemium", logoUrl: "/images/tools/lovable.png", description: "สร้างเว็บแอปด้วยการพิมพ์คุยกับ AI ไม่ต้องเขียนโค้ดเอง" },

  // งานเอกสารและนำเสนอ
  { id: "notion", name: "Notion AI", category: "งานเอกสารและนำเสนอ", url: "https://www.notion.com/product/ai", pricing: "freemium", logoUrl: "/images/tools/notion.png", description: "สรุป เขียน และค้นหาข้อมูลในโน้ตและเอกสารบน Notion" },
  { id: "grammarly", name: "Grammarly", category: "งานเอกสารและนำเสนอ", url: "https://www.grammarly.com", pricing: "freemium", description: "ตรวจไวยากรณ์และปรับสำนวนภาษาอังกฤษ ใช้ได้เกือบทุกเว็บ" },
  { id: "gamma", name: "Gamma", category: "งานเอกสารและนำเสนอ", url: "https://gamma.app", pricing: "freemium", logoUrl: "/images/tools/gamma.jpg", description: "สร้างสไลด์นำเสนอ เอกสาร และเว็บเพจจากหัวข้อได้ในไม่กี่นาที" },

  // ระบบอัตโนมัติ
  { id: "zapier", name: "Zapier", category: "ระบบอัตโนมัติ", url: "https://zapier.com", pricing: "freemium", logoUrl: "/images/tools/zapier.png", description: "เชื่อมแอปหลายพันตัวให้ทำงานต่อกันอัตโนมัติ มี AI ช่วยสร้างขั้นตอน" },
];

export async function getAiTools(): Promise<AiTool[]> {
  return aiTools;
}
