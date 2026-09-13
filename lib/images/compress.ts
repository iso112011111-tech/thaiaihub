"use client";

/**
 * Shrinks an image in the browser and returns it as a data URI.
 *
 * Firestore caps a document at 1 MiB and base64 inflates bytes by ~33%, so raw
 * uploads can never be stored directly — everything is re-encoded to WebP at a
 * bounded size first. A 1200px-wide WebP at q0.75 typically lands at 40-90 KB.
 */
export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  /** Encoded size ceiling in bytes; quality steps down until it fits. */
  maxBytes?: number;
}

const DEFAULTS: Required<CompressOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.75,
  maxBytes: 180 * 1024,
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("เปิดไฟล์ภาพไม่สำเร็จ"));
    };
    image.src = url;
  });
}

/** Bytes a data URI actually costs in Firestore (the base64 payload itself). */
export function dataUriBytes(dataUri: string) {
  return new Blob([dataUri]).size;
}

export async function compressToDataUri(
  file: File,
  options: CompressOptions = {},
): Promise<string> {
  const { maxWidth, maxHeight, quality, maxBytes } = { ...DEFAULTS, ...options };
  const image = await loadImage(file);

  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("เบราว์เซอร์ไม่รองรับการบีบอัดภาพ");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Step quality down until the encoded result fits the budget.
  let current = quality;
  let dataUri = canvas.toDataURL("image/webp", current);
  while (dataUriBytes(dataUri) > maxBytes && current > 0.35) {
    current -= 0.1;
    dataUri = canvas.toDataURL("image/webp", current);
  }

  if (dataUriBytes(dataUri) > maxBytes) {
    throw new Error(
      `ภาพ ${file.name} ใหญ่เกินไปแม้บีบอัดแล้ว กรุณาย่อขนาดก่อนอัปโหลด`,
    );
  }
  return dataUri;
}
