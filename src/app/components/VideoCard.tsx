import type { Video } from "../models/video";
import { Share2 } from "lucide-react";
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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoPageUrl = `${window.location.origin}/video/${video.id}`;

  const embedUrl = playing ? withAutoplay(video.videoUrl) : video.videoUrl;

  const shareToTwitter = () => {
    const text = `Check out ${video.title} by ${video.artist}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(videoPageUrl)}`,
      "_blank"
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoPageUrl)}`,
      "_blank"
    );
  };

  const copyLink = () => {
    navigator.clipboard.writeText(videoPageUrl);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="group">
      {/* Video Player */}
      <div className="relative mb-4 aspect-video overflow-hidden rounded-md bg-black">
        {playing ? (
          <iframe
            src={embedUrl}
            title={`${video.artist} - ${video.title}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="w-full h-full relative block group/thumb"
            aria-label={`Play ${video.title} by ${video.artist}`}
          >
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={`${video.artist} - ${video.title}`}
                className="h-full w-full object-cover transition-opacity duration-200 group-hover/thumb:opacity-75"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center px-6 text-center font-['JetBrains_Mono'] text-sm font-extrabold uppercase text-white">
                Preview unavailable
              </span>
            )}
          </button>
        )}
      </div>

      {/* Video Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <Link to={`/video/${video.id}`}>
              <h3 className="cursor-pointer font-['JetBrains_Mono'] text-2xl font-extrabold uppercase leading-7 tracking-[-0.36px] transition-colors hover:text-[#D9E800]">
                {video.title}
              </h3>
            </Link>
            <p className="font-['Kommuna_Demo'] text-[28px] font-normal leading-[33px] text-white">
              {video.artist}
            </p>
          </div>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="rounded p-2 transition-colors hover:bg-white hover:text-black"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {showShareMenu && (
              <div className="absolute right-0 z-10 mt-2 min-w-[140px] space-y-1 rounded-md border border-white bg-black p-2 shadow-lg">
                <button
                  onClick={shareToTwitter}
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-white hover:text-black"
                >
                  Twitter
                </button>
                <button
                  onClick={shareToFacebook}
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-white hover:text-black"
                >
                  Facebook
                </button>
                <button
                  onClick={copyLink}
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-white hover:text-black"
                >
                  Copy link
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap gap-2">
            {video.techniques.map((technique) => (
              <button
                key={technique}
                onClick={() => onTagClick(technique, "technique")}
                className="rounded-md bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 transition-colors hover:bg-[#D9E800] hover:text-black"
              >
                {technique}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap gap-2">
            {video.creators.director && (
              <button
                onClick={() => onTagClick(video.creators.director!, "creator")}
                className="rounded-md bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 transition-colors hover:bg-[#D9E800] hover:text-black"
              >
                {video.creators.director}
              </button>
            )}
            {video.creators.productionCompany && (
              <button
                onClick={() => onTagClick(video.creators.productionCompany!, "creator")}
                className="rounded-md bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 transition-colors hover:bg-[#D9E800] hover:text-black"
              >
                {video.creators.productionCompany}
              </button>
            )}
            {video.creators.dop && (
              <button
                onClick={() => onTagClick(video.creators.dop!, "creator")}
                className="rounded-md bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 transition-colors hover:bg-[#D9E800] hover:text-black"
              >
                {video.creators.dop}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onTagClick(video.decade, "decade")}
              className="rounded-md bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 transition-colors hover:bg-[#D9E800] hover:text-black"
            >
              {video.decade}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
