import Image from "next/image";
import { STATION_MEDIA_COPY } from "@/constants/station-media";
import type { MediaPreviewProps } from "@/types/management-ui";
import { safeMediaUrl } from "@/utils/station-media";

export function MediaPreview({ url, label, poster, video }: MediaPreviewProps) {
  const source = safeMediaUrl(url);
  if (!source) return null;

  return (
    <div className="grid gap-1.5">
      {video ? (
        <video
          src={source}
          poster={safeMediaUrl(poster)}
          aria-label={label}
          controls
          playsInline
          preload="none"
          className="aspect-video w-full rounded-lg bg-sidebar object-contain"
        />
      ) : (
        <div className="relative aspect-video overflow-hidden rounded-lg bg-workspace">
          <Image
            src={source}
            alt={label}
            fill
            unoptimized
            referrerPolicy="no-referrer"
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover"
          />
        </div>
      )}
      <a
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        className="w-fit text-xs font-medium text-brand underline"
      >
        {STATION_MEDIA_COPY.openMedia}
      </a>
    </div>
  );
}
