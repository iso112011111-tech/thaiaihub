import Image from "next/image";
import { coverGradients } from "@/lib/constants";
import { safeImageSrc } from "@/lib/images/safe-src";
import { cn, hashToIndex } from "@/lib/utils";

/**
 * Card artwork. Uses the real cover when provided, otherwise a deterministic
 * gradient plate with the category name — never a broken image, never an emoji.
 */
export function CoverArt({
  seed,
  label,
  src,
  showLabel = true,
  className,
}: {
  seed: string;
  label: string;
  src?: string;
  /** Hidden on thumbnails, where there is no room for a caption. */
  showLabel?: boolean;
  className?: string;
}) {
  // Covers are user-supplied; an unexpected source falls back to the gradient.
  const image = safeImageSrc(src);

  if (image) {
    return (
      <div className={cn("relative overflow-hidden bg-surface-muted", className)}>
        <Image
          src={image}
          alt={label}
          fill
          sizes="(max-width: 1024px) 50vw, 300px"
          // Data URIs are already sized and encoded by the uploader; the
          // optimiser cannot process them and would throw.
          unoptimized={image.startsWith("data:")}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
    );
  }

  const gradient = coverGradients[hashToIndex(seed, coverGradients.length)];

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        gradient,
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.6) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {showLabel ? (
        <span className="absolute bottom-2.5 left-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/85">
          {label}
        </span>
      ) : null}
    </div>
  );
}
