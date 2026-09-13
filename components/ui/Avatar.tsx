import Image from "next/image";
import { safeImageSrc } from "@/lib/images/safe-src";
import { cn, initials } from "@/lib/utils";

const sizes = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
  xl: "size-20 text-xl",
} as const;

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  // Avatars come from user-written profiles; render only sources we trust.
  const image = safeImageSrc(src);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-accent-soft font-semibold text-accent-hover ring-1 ring-line",
        sizes[size],
        className,
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          sizes="80px"
          // Avatars are stored as data URIs in Firestore; the optimiser cannot read them.
          unoptimized={image.startsWith("data:")}
          className="object-cover"
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
