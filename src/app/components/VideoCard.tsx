import type { Video } from "../models/video";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { getYouTubeVideoId, getYouTubeWatchUrl } from "../youtube";
import { getVideoSourceThumbnail } from "../videoThumbnails";

interface VideoCardProps {
  video: Video;
  imageSizes: string;
  onTagClick: (tag: string, type: "technique" | "creator" | "decade") => void;
}

function getThumbnailCandidates(video: Video): string[] {
  const youtubeId = getYouTubeVideoId(video.videoUrl)
  const youtubeThumbnails = youtubeId
    ? [
        `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${youtubeId}/sddefault.jpg`,
        `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
        `https://i.ytimg.com/vi/${youtubeId}/0.jpg`,
      ]
    : []

  return [
    video.thumbnail.trim(),
    ...(video.media?.stills ?? []).map((still) => still.src),
    ...youtubeThumbnails,
  ].filter((source, index, sources) => source && sources.indexOf(source) === index)
}

function isYouTubeThumbnail(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return hostname === "img.youtube.com" || hostname.endsWith(".ytimg.com")
  } catch {
    return false
  }
}

const videoTagListClassName = "flex flex-wrap gap-1.5 @md:gap-2"
const videoTagClassName =
  "rounded-sm border border-white/20 bg-black px-2 py-0.5 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-xs leading-5 text-white transition-colors hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black @md:px-3 @md:py-1 @md:text-sm"

function withAutoplay(url: string): string {
  try {
    const embed = new URL(url);
    embed.searchParams.set("autoplay", "1");
    if (getYouTubeVideoId(url)) {
      embed.searchParams.set("enablejsapi", "1");
      embed.searchParams.set("origin", window.location.origin);
    }
    return embed.toString();
  } catch {
    return url;
  }
}

export function VideoCard({ video, imageSizes, onTagClick }: VideoCardProps) {
  const [playing, setPlaying] = useState(false);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [providerThumbnail, setProviderThumbnail] = useState<string | null>(null);
  const [providerThumbnailFailed, setProviderThumbnailFailed] = useState(false);
  const [embedBlocked, setEmbedBlocked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const embedUrl = playing ? withAutoplay(video.videoUrl) : video.videoUrl;
  const thumbnailCandidates = getThumbnailCandidates(video);
  const primaryThumbnailUrl = thumbnailCandidates[thumbnailIndex];
  const youtubeWatchUrl = getYouTubeWatchUrl(video.videoUrl);

  useEffect(() => {
    if (thumbnailIndex < thumbnailCandidates.length) return

    let active = true
    const sourceUrls = [video.videoDirectUrl, video.videoUrl].filter(
      (url): url is string => Boolean(url),
    )
    getVideoSourceThumbnail(sourceUrls).then((thumbnail) => {
      if (active) setProviderThumbnail(thumbnail)
    })

    return () => {
      active = false
    }
  }, [
    thumbnailIndex,
    thumbnailCandidates.length,
    video.videoDirectUrl,
    video.videoUrl,
  ])

  useEffect(() => {
    if (!youtubeWatchUrl) return

    const handleMessage = (event: MessageEvent) => {
      if (
        event.source !== iframeRef.current?.contentWindow ||
        !["https://www.youtube.com", "https://www.youtube-nocookie.com"].includes(
          event.origin,
        )
      ) {
        return
      }

      let payload: unknown = event.data
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload)
        } catch {
          return
        }
      }
      if (!payload || typeof payload !== "object") return

      const message = payload as { event?: unknown; info?: unknown }
      if (
        message.event === "onError" ||
        [100, 101, 150].includes(Number(message.info))
      ) {
        setEmbedBlocked(true)
        setPlaying(false)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [youtubeWatchUrl])

  const thumbnailUrl =
    primaryThumbnailUrl ??
    (providerThumbnailFailed ? null : providerThumbnail)
  const thumbnailContent =
    thumbnailUrl ? (
      <img
        src={thumbnailUrl}
        sizes={imageSizes}
        alt={`${video.artist} - ${video.title}`}
        loading="lazy"
        decoding="async"
        className="size-full object-cover transition-opacity duration-200 group-hover/thumb:opacity-75"
        onLoad={(event) => {
          if (
            isYouTubeThumbnail(thumbnailUrl) &&
            event.currentTarget.naturalWidth <= 120
          ) {
            if (primaryThumbnailUrl) {
              setThumbnailIndex((index) =>
                Math.min(index + 1, thumbnailCandidates.length),
              )
            } else {
              setProviderThumbnailFailed(true)
            }
          }
        }}
        onError={() => {
          if (primaryThumbnailUrl) {
            setThumbnailIndex((index) =>
              Math.min(index + 1, thumbnailCandidates.length),
            )
          } else {
            setProviderThumbnailFailed(true)
          }
        }}
      />
    ) : (
      <span className="flex size-full items-center justify-center px-6 text-center font-['JetBrains_Mono'] text-sm font-extrabold uppercase text-white/60">
        Preview unavailable
      </span>
    )

  return (
    <div className="group @container">
      {/* Video Player / Thumbnail */}
      <div className="relative mb-3 aspect-video overflow-hidden rounded-sm bg-black @md:mb-4">
        {playing ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={`${video.artist} - ${video.title}`}
            className="block size-full border-0 outline-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            onError={
              youtubeWatchUrl
                ? () => {
                    setEmbedBlocked(true)
                    setPlaying(false)
                  }
                : undefined
            }
          />
        ) : (
          embedBlocked && youtubeWatchUrl ? (
            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch ${video.title} on YouTube`}
              className="group/thumb relative block size-full"
            >
              {thumbnailContent}
              <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="rounded border border-white/40 bg-black/80 px-3 py-2 font-['JetBrains_Mono'] text-sm font-bold uppercase text-white">
                  Watch on YouTube
                </span>
              </span>
            </a>
          ) : (
            <button
              onClick={() => {
                setEmbedBlocked(false)
                setPlaying(true)
              }}
              className="group/thumb relative block size-full"
              aria-label={`Play ${video.title} by ${video.artist}`}
            >
              {thumbnailContent}
            </button>
          )
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