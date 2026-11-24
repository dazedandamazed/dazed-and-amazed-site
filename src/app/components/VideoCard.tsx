import type { Video } from "../models/video";
import { useState } from "react";
import { Link } from "react-router";

interface VideoCardProps {
  video: Video;
  onTagClick: (tag: string, type: "technique" | "creator" | "decade") => void;
}

function withAutoplay(url: string): string {
  try {
    const embed = new URL(url);
    embed.searchParams.set("autoplay", "1");
    return embed.toString();
  } catch {
    return url;
  }
}

export function VideoCard({ video, onTagClick }: VideoCardProps) {
  const [playing, setPlaying] = useState(false);

  const embedUrl = playing ? withAutoplay(video.videoUrl) : video.videoUrl;

  return (
    <div className="group">
      {/* Video Player / Thumbnail */}
      <div className="relative mb-4 aspect-video overflow-hidden rounded-sm bg-black">
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
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={`${video.artist} - ${video.title}`}
                className="size-full object-cover transition-opacity duration-200 group-hover/thumb:opacity-75"
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
      <div className="space-y-4">
        {/* Title & Artist with generous breathing room */}
        <div>
          <Link to={`/video/${video.id}`}>
            <h3 className="cursor-pointer font-['JetBrains_Mono'] text-2xl font-extrabold uppercase leading-tight tracking-[-0.36px] transition-colors hover:text-[#D9E800]">
              {video.title}
            </h3>
          </Link>
          <button
            onClick={() => onTagClick(video.artist, "creator")}
            className="mt-2 block cursor-pointer text-left font-['Kommuna_Demo'] text-[28px] font-normal leading-[33px] text-white transition-colors hover:text-[#D9E800] active:text-[#D9E800]"
            title={`Filter by ${video.artist}`}
          >
            {video.artist}
          </button>
        </div>

        {/* Tag Categories with consistent spacing scale */}
        <div className="space-y-2.5">
          {/* Techniques */}
          {video.techniques && video.techniques.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {video.techniques.map((technique) => (
                <button
                  key={technique}
                  onClick={() => onTagClick(technique, "technique")}
                  className="rounded-sm border border-white/20 bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 text-white transition-colors hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black"
                >
                  {technique}
                </button>
              ))}
            </div>
          )}

          {/* Creators */}
          {video.creators && (
            <div className="flex flex-wrap gap-2">
              {video.creators.director && (
                <button
                  onClick={() => onTagClick(video.creators.director!, "creator")}
                  className="rounded-sm border border-white/20 bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 text-white transition-colors hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black"
                >
                  Dir: {video.creators.director}
                </button>
              )}
              {video.creators.productionCompany && (
                <button
                  onClick={() =>
                    onTagClick(video.creators.productionCompany!, "creator")
                  }
                  className="rounded-sm border border-white/20 bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 text-white transition-colors hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black"
                >
                  Prod: {video.creators.productionCompany}
                </button>
              )}
              {video.creators.dop && (
                <button
                  onClick={() => onTagClick(video.creators.dop!, "creator")}
                  className="rounded-sm border border-white/20 bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 text-white transition-colors hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black"
                >
                  DOP: {video.creators.dop}
                </button>
              )}
            </div>
          )}

          {/* Decade */}
          {video.decade && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onTagClick(video.decade, "decade")}
                className="rounded-sm border border-white/20 bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 text-white transition-colors hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black"
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