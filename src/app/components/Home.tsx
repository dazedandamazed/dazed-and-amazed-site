import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import type { Video } from "../models/video";
import { useVideoArchive } from "../hooks/useVideoArchive";
import { VideoCard } from "./VideoCard";
import { Search, X } from "lucide-react";

const ITEMS_PER_PAGE = 12;

function shuffle(arr: Video[]): Video[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Home() {
  const { videos, loading, error } = useVideoArchive();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [baseList, setBaseList] = useState<Video[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Shuffle after the Supabase archive loads.
  useEffect(() => {
    setBaseList(shuffle(videos));
  }, [videos]);

  // Seed active tags from ?filter= URL param on mount
  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter) setActiveTags([filter]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset visible count when filters or base list change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, activeTags, baseList]);

  const filteredVideos = useMemo(() => {
    let result = baseList;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.artist.toLowerCase().includes(query) ||
          video.techniques.some((t) => t.toLowerCase().includes(query)) ||
          video.creators.director?.toLowerCase().includes(query) ||
          video.creators.productionCompany?.toLowerCase().includes(query) ||
          video.creators.dop?.toLowerCase().includes(query) ||
          video.decade.toLowerCase().includes(query)
      );
    }

    if (activeTags.length > 0) {
      result = result.filter((video) =>
        activeTags.every((tag) => {
          const tagLower = tag.toLowerCase();
          return (
            video.techniques.some((t) => t.toLowerCase() === tagLower) ||
            video.creators.director?.toLowerCase() === tagLower ||
            video.creators.productionCompany?.toLowerCase() === tagLower ||
            video.creators.dop?.toLowerCase() === tagLower ||
            video.decade.toLowerCase() === tagLower
          );
        })
      );
    }

    return result;
  }, [baseList, searchQuery, activeTags]);

  // IntersectionObserver — load more when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < filteredVideos.length) {
          setVisibleCount((n) => Math.min(n + ITEMS_PER_PAGE, filteredVideos.length));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, filteredVideos.length]);

  const visibleVideos = filteredVideos.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVideos.length;

  const handleTagClick = (tag: string, _type: "technique" | "creator" | "decade") => {
    const next = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag];
    setActiveTags(next);
    if (next.length === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ filter: next[0] });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveTags([]);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <div className="mx-auto mb-8 flex h-[50px] w-full max-w-[672px] items-center">
        <div className="relative h-[26px] w-full">
          <Search className="pointer-events-none absolute left-[31px] top-1/2 size-[12.75px] -translate-y-1/2 text-white" />
          <input
            type="text"
            placeholder="Search by title, artist, technique, director..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[26px] w-full rounded-[7px] border border-[#D9E800] bg-black pl-[53.75px] pr-[53.75px] font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-base leading-[24px] text-white placeholder:text-white focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-[31px] top-1/2 -translate-y-1/2 text-white transition-colors hover:text-[#D9E800]"
              aria-label="Clear search"
            >
              <X className="size-[12.75px]" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {(activeTags.length > 0 || searchQuery) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-white">Active filters:</span>
          {activeTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag, "technique")}
              className="flex items-center space-x-2 rounded-sm bg-white px-3 py-1 text-sm text-black transition-colors hover:bg-[#D9E800]"
            >
              <span>{tag}</span>
              <X className="w-3 h-3" />
            </button>
          ))}
          {searchQuery && (
            <span className="rounded-sm border border-white bg-black px-3 py-1 text-sm">
              Search: &quot;{searchQuery}&quot;
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 text-sm text-white underline hover:text-[#D9E800]"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-white">
          {loading
            ? "Loading videos..."
            : `${filteredVideos.length} ${
                filteredVideos.length === 1 ? "video" : "videos"
              }${hasMore ? ` — showing ${visibleVideos.length}` : ""}`}
        </p>
      </div>

      {/* Video Grid */}
      {error ? (
        <div className="text-center py-20">
          <p className="text-lg text-white">{error}</p>
        </div>
      ) : visibleVideos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {visibleVideos.map((video) => (
              <VideoCard key={video.id} video={video} onTagClick={handleTagClick} />
            ))}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className="py-12 flex justify-center">
              <span className="text-sm text-white">Loading more...</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          {loading ? null : videos.length === 0 ? (
            <p className="text-lg text-white">No videos in the archive yet.</p>
          ) : (
            <>
              <p className="text-lg text-white">No videos found matching your criteria.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 rounded bg-white px-6 py-2 text-black transition-colors hover:bg-[#D9E800]"
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
