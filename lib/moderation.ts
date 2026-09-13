/** Why a reader reports a prompt. Shared by the report button, its API and the admin queue. */
export const REPORT_REASONS = [
  { id: "spam", label: "สแปม / โฆษณา" },
  { id: "inappropriate", label: "เนื้อหาไม่เหมาะสม" },
  { id: "copyright", label: "ละเมิดลิขสิทธิ์" },
  { id: "misleading", label: "ข้อมูลเท็จหรือหลอกลวง" },
  { id: "other", label: "อื่นๆ" },
] as const;

export function reportReasonLabel(id: string): string {
  return REPORT_REASONS.find((reason) => reason.id === id)?.label ?? id;
}
