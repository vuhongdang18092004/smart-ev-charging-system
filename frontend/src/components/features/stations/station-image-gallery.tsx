import { STATION_MEDIA_COPY } from "@/constants/station-media";
import type { StationImageGalleryProps } from "@/types/management-ui";
import { MediaPreview } from "./media-preview";

export function StationImageGallery({ images }: StationImageGalleryProps) {
  return (
    <section className="grid gap-3">
      <h3 className="font-semibold">{STATION_MEDIA_COPY.images}</h3>
      {images.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <li key={image.id} className="min-w-0">
              <figure className="grid gap-2 rounded-xl border border-line p-3">
                <MediaPreview
                  url={image.url}
                  label={
                    image.caption || STATION_MEDIA_COPY.imageNumber(index + 1)
                  }
                />
                {(image.is_primary || image.caption) && (
                  <figcaption className="flex flex-wrap items-center gap-2 break-all text-sm">
                    {image.is_primary && (
                      <span className="rounded-full bg-workspace px-2 py-0.5 font-medium text-brand">
                        {STATION_MEDIA_COPY.primary}
                      </span>
                    )}
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600">{STATION_MEDIA_COPY.noImages}</p>
      )}
    </section>
  );
}
