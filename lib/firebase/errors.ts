/** Firebase error codes rendered as Thai messages a user can act on. */
const messages: Record<string, string> = {
  // Auth
  "auth/invalid-email": "รูปแบบอีเมลไม่ถูกต้อง",
  "auth/user-disabled": "บัญชีนี้ถูกระงับการใช้งาน",
  "auth/user-not-found": "ไม่พบบัญชีนี้ในระบบ",
  "auth/wrong-password": "รหัสผ่านไม่ถูกต้อง",
  "auth/invalid-credential": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  "auth/email-already-in-use": "อีเมลนี้ถูกใช้สมัครไปแล้ว",
  "auth/weak-password": "รหัสผ่านสั้นเกินไป ต้องมีอย่างน้อย 8 ตัวอักษร",
  "auth/popup-closed-by-user": "คุณปิดหน้าต่างก่อนเข้าสู่ระบบสำเร็จ",
  "auth/cancelled-popup-request": "มีหน้าต่างเข้าสู่ระบบเปิดค้างอยู่แล้ว",
  "auth/popup-blocked": "เบราว์เซอร์บล็อกหน้าต่างเข้าสู่ระบบ กรุณาอนุญาตป๊อปอัป",
  "auth/unauthorized-domain":
    "โดเมนนี้ยังไม่ได้รับอนุญาต ให้เพิ่มใน Firebase Console > Authentication > Settings > Authorized domains",
  "auth/account-exists-with-different-credential":
    "อีเมลนี้เคยสมัครด้วยวิธีอื่น ลองเข้าสู่ระบบด้วยวิธีเดิม",
  "auth/operation-not-allowed": "ยังไม่ได้เปิดใช้วิธีเข้าสู่ระบบนี้ใน Firebase Console",
  "auth/configuration-not-found": "ยังไม่ได้เปิดใช้งาน Authentication ใน Firebase Console",
  "auth/too-many-requests": "ลองหลายครั้งเกินไป กรุณารอสักครู่",
  "auth/network-request-failed": "เชื่อมต่อเครือข่ายไม่สำเร็จ",
  "auth/internal-error": "Firebase ตอบกลับผิดพลาด กรุณาลองใหม่",

  // Firestore — these surface during sign-in too, because signing in writes a profile
  "permission-denied":
    "Firestore ปฏิเสธการเขียน ตรวจสอบว่า deploy firestore.rules แล้ว",
  unauthenticated: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
  unavailable: "ติดต่อ Firestore ไม่ได้ ตรวจสอบการเชื่อมต่อเครือข่าย",
  "resource-exhausted": "ใช้โควตา Firestore เกินกำหนดของวันนี้",
  "invalid-argument": "ข้อมูลที่ส่งไปไม่ถูกต้อง อาจมีไฟล์ใหญ่เกิน 1 MB",
};

/**
 * Never swallow an unrecognised code: showing it is what makes a bug
 * diagnosable instead of a dead end that just says "something went wrong".
 */
export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  if (messages[code]) return messages[code];

  const detail = code || (error as { message?: string })?.message || "";
  return detail
    ? `เกิดข้อผิดพลาด: ${detail}`
    : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}
