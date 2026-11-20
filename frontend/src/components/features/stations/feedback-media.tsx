import {
  IMAGE_MEDIA_TYPE,
  STATION_MEDIA_COPY,
} from "@/constants/station-media";
import type { FeedbackMediaProps } from "@/types/management-ui";
import { MediaPreview } from "./media-preview";

export function FeedbackMedia({ media }: FeedbackMediaProps) {
  if (!media.length) return null;

  return (
    <ul
      aria-label={STATION_MEDIA_COPY.media}
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      {media.map((item, index) => (
        <li
          key={item.id}
          className="grid min-w-0 gap-1 rounded-lg border border-line p-2"
        >
          <p className="text-xs font-medium">
            {STATION_MEDIA_COPY.mediaLabels[item.media_type]}
          </p>
          <MediaPreview
            url={item.url}
            poster={item.thumbnail_url}
            video={item.media_type !== IMAGE_MEDIA_TYPE}
            label={STATION_MEDIA_COPY.mediaNumber(index + 1)}
          />
        </li>
      ))}
    </ul>
  );
}
