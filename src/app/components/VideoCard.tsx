import type { Video } from "../models/video";
import { useState } from "react";
import { Link } from "react-router";

interface VideoCardProps {
  video: Video;
  imageSizes: string;
  onTagClick: (tag: string, type: "technique" | "creator" | "decade") => void;
}

function getYouTubeThumbnailSources(thumbnail: string) {
  const match = thumbnail.match(/^https?:\/\/i\d*\.ytimg\.com\/vi\/([^/]+)\//)
  if (!match) return null

  const baseUrl = `https://i.ytimg.com/vi/${match[1]}`
  return {
    fallbacks: [`${baseUrl}/sddefault.jpg`, `${baseUrl}/hqdefault.jpg`],
    srcSet: [
      `${baseUrl}/hqdefault.jpg 480w`,
      `${baseUrl}/sddefault.jpg 640w`,
      `${baseUrl}/maxresdefault.jpg 1280w`,
    ].join(", "),
  }
}

const videoTagListClassName = "flex flex-wrap gap-1.5 @md:gap-2"
const videoTagClassName =
  "rounded-sm border border-white/20 bg-black px-2 py-0.5 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-xs leading-5 text-white transition-colors hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black @md:px-3 @md:py-1 @md:text-sm"

function withAutoplay(url: string): string {
  try {
    const embed = new URL(url);
    embed.searchParams.set("autoplay", "1");
    return embed.toString();
  } catch {
    return url;
  }
}

export function VideoCard({ video, imageSizes, onTagClick }: VideoCardProps) {
  const [playing, setPlaying] = useState(false);
  const [thumbnailFallbackIndex, setThumbnailFallbackIndex] = useState(0);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  const embedUrl = playing ? withAutoplay(video.videoUrl) : video.videoUrl;
  const youtubeThumbnailSources = getYouTubeThumbnailSources(video.thumbnail);

  return (
    <div className="group @container">
      {/* Video Player / Thumbnail */}
      <div className="relative mb-3 aspect-video overflow-hidden rounded-sm bg-black @md:mb-4">
        {playing ? (
          <iframe
            src={embedUrl}
            title={`${video.artist} - ${video.title}`}
            className="block size-full border-0 outline-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="group/thumb relative block size-full"
            aria-label={`Play ${video.title} by ${video.artist}`}
          >
            {video.thumbnail && !thumbnailFailed ? (
              <img
                src={
                  thumbnailFallbackIndex > 0 && youtubeThumbnailSources
                    ? youtubeThumbnailSources.fallbacks[thumbnailFallbackIndex - 1]
                    : video.thumbnail
                }
                srcSet={
                  thumbnailFallbackIndex > 0
                    ? undefined
                    : youtubeThumbnailSources?.srcSet
                }
                sizes={imageSizes}
                alt={`${video.artist} - ${video.title}`}
                loading="lazy"
                decoding="async"
                className="size-full object-cover transition-opacity duration-200 group-hover/thumb:opacity-75"
                onError={() => {
                  if (
                    youtubeThumbnailSources &&
                    thumbnailFallbackIndex < youtubeThumbnailSources.fallbacks.length
                  ) {
                    setThumbnailFallbackIndex((index) => index + 1);
                  } else {
                    setThumbnailFailed(true);
                  }
                }}
              />
            ) : (
              <span className="flex size-full items-center justify-center px-6 text-center font-['JetBrains_Mono'] text-sm font-extrabold uppercase text-white">
                Preview unavailable
              </span>
            )}
          </button>
        )}
      </div>

      {/* Video Info */}
      <div className="space-y-3 @md:space-y-4">
        {/* Title & Artist with generous breathing room */}
        <div>
          <Link to={`/video/${video.id}`}>
            <h3 className="cursor-pointer font-['JetBrains_Mono'] text-lg font-extrabold uppercase leading-tight tracking-[-0.36px] transition-colors hover:text-[#D9E800] @sm:text-xl @md:text-[22px] @xl:text-2xl">
              {video.title}
            </h3>
          </Link>
          <button
            onClick={() => onTagClick(video.artist, "creator")}
            className="mt-1.5 block cursor-pointer text-left font-['Kommuna_Demo'] text-xl font-normal leading-tight text-white transition-colors hover:text-[#D9E800] active:text-[#D9E800] @md:mt-2 @sm:text-2xl @lg:text-[28px]"
            title={`Filter by ${video.artist}`}
          >
            {video.artist}
          </button>
        </div>

        {/* Tag Categories with consistent spacing scale */}
        <div className="space-y-2">
          {/* Techniques */}
          {video.techniques && video.techniques.length > 0 && (
            <div className={videoTagListClassName}>
              {video.techniques.map((technique) => (
                <button
                  key={technique}
                  onClick={() => onTagClick(technique, "technique")}
                  className={videoTagClassName}
                >
                  {technique}
                </button>
              ))}
            </div>
          )}

          {/* Creators */}
          {video.creators && (
            <div className={videoTagListClassName}>
              {video.creators.director && (
                <button
                  onClick={() => onTagClick(video.creators.director!, "creator")}
                  className={videoTagClassName}
                >
                  Dir: {video.creators.director}
                </button>
              )}
              {video.creators.productionCompany && (
                <button
                  onClick={() =>
                    onTagClick(video.creators.productionCompany!, "creator")
                  }
                  className={videoTagClassName}
                >
                  Prod: {video.creators.productionCompany}
                </button>
              )}
              {video.creators.dop && (
                <button
                  onClick={() => onTagClick(video.creators.dop!, "creator")}
                  className={videoTagClassName}
                >
                  DOP: {video.creators.dop}
                </button>
              )}
            </div>
          )}

          {/* Decade */}
          {video.decade && (
            <div className={videoTagListClassName}>
              <button
                onClick={() => onTagClick(video.decade, "decade")}
                className={videoTagClassName}
              >
                {video.decade}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}