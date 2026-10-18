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
        <div>
          <Link to={`/video/${video.id}`}>
            <h3 className="cursor-pointer font-['JetBrains_Mono'] text-2xl font-extrabold uppercase leading-7 tracking-[-0.36px] transition-colors hover:text-[#D9E800]">
              {video.title}
            </h3>
          </Link>
          <p className="font-['Kommuna_Demo'] text-[28px] font-normal lead