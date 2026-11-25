import { useState, useMemo, useEffect, useRef } from "react"
import { useSearchParams, Outlet } from "react-router"
import type { Video } from "../models/video"
import { useVideoArchive } from "../hooks/useVideoArchive"
import { VideoCard } from "./VideoCard"
import { Search, X } from "lucide-react"

const ITEMS_PER_PAGE = 12

// Curated quick-access tags for the horizontal pill bar
const QUICK_TAGS = [
  "35mm / Film",
  "Split Screen",
  "One Take",
  "CGI",
  "Stop Motion",
  "Surrealism",
  "Practical FX",
  "Choreography",
  "Black & White",
  "Storytelling",
  "Miniatures",
]

function shuffle(arr: Video[]): Video[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function Home() {
  const { videos, loading, error } = useVideoArchive()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [baseList, setBaseList] = useState<Video[]>([])
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [placeholder, setPlaceholder] = useState("Search archive")
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Grid density: 2 (cinema), 3 (standard), 4 (dense). Saved in localStorage
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dazed_grid_cols")
      if (saved === "2" || saved === "3" || saved === "4") {
        return Number(saved) as 2 | 3 | 4
      }
    }
    return 2
  })

  const handleSetGridCols = (cols: 2 | 3 | 4) => {
    setGridCols(cols)
    if (typeof window !== "undefined") {
      localStorage.setItem("dazed_grid_cols", String(cols))
    }
  }

  // Responsive search placeholder for mobile vs desktop
  useEffect(() => {
    const updatePlaceholder = () => {
      if (window.innerWidth >= 640) {
        setPlaceholder("Search by title, artist, technique, director...")
      } else {
        setPlaceholder("Search archive")
      }
    };
    updatePlaceholder()
    window.addEventListener("resize", updatePlaceholder)
    return () => window.removeEventListener("resize", updatePlaceholder)
  }, [])

  // Shuffle after Supabase archive loads
  useEffect(() => {
    setBaseList(shuffle(videos))
  }, [videos])

  // Sync ?filter= URL query param with activeTags state
  useEffect(() => {
    const filter = searchParams.get("filter")
    if (filter) {
      setActiveTags([filter])
    } else {
      setActiveTags([])
    }
  }, [searchParams])

  // Reset visible count when filters or base list change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
  }, [searchQuery, activeTags, baseList])

  // Universal Full-Text Search and Multi-Tag Filtering
  const filteredVideos = useMemo(() => {
    let result = baseList

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((video) => {
        const descEn = video.descriptions?.en?.toLowerCase() || ""
        const descRu = video.descriptions?.ru?.toLowerCase() || ""
        const title = video.title.toLowerCase()
        const artist = video.artist.toLowerCase()
        const director = video.creators.director?.toLowerCase() || ""
        const production = video.creators.productionCompany?.toLowerCase() || ""
        const dop = video.creators.dop?.toLowerCase() || ""
        const decade = video.decade.toLowerCase()

        return (
          title.includes(query) ||
          artist.includes(query) ||
          descEn.includes(query) ||
          descRu.includes(query) ||
          director.includes(query) ||
          production.includes(query) ||
          dop.includes(query) ||
          decade.includes(query) ||
          video.techniques.some((t) => t.toLowerCase().includes(query))
        )
      })
    }

    if (activeTags.length > 0) {
      result = result.filter((video) =>
        activeTags.every((tag) => {
          const tagLower = tag.toLowerCase()
          return (
            video.artist.toLowerCase() === tagLower ||
            video.techniques.some((t) => t.toLowerCase() === tagLower) ||
            video.creators.director?.toLowerCase() === tagLower ||
            video.creators.productionCompany?.toLowerCase() === tagLower ||
            video.creators.dop?.toLowerCase() === tagLower ||
            video.decade.toLowerCase() === tagLower
          )
        })
      )
    }

    return result
  }, [baseList, searchQuery, activeTags])

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < filteredVideos.length) {
          setVisibleCount((n) => Math.min(n + ITEMS_PER_PAGE, filteredVideos.length))
        }
      },
      { rootMargin: "400px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visibleCount, filteredVideos.length])

  const visibleVideos = filteredVideos.slice(0, visibleCount)
  const hasMore = visibleCount < filteredVideos.length

  const handleTagClick = (tag: string) => {
    const next = activeTags.includes(tag)
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag]
    setActiveTags(next)
    if (next.length === 0) {
      setSearchParams({})
    } else {
      setSearchParams({ filter: next[0] })
    }
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setActiveTags([])
    setSearchParams({})
  }

  // Dynamic grid class based on grid density selector
  const gridClass = useMemo(() => {
    if (gridCols === 4) {
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8"
    }
    if (gridCols === 3) {
      return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10"
    }
    return "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
  }, [gridCols])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 1. Concise Editorial Statement (Single Line) */}
      <div className="mb-6 text-center">
        <p className="font-['Kommuna_Demo'] text-lg font-normal tracking-wide text-white sm:text-xl lg:text-2xl">
          A curated collection of music videos with top-tier craft and direction.
        </p>
      </div>

      {/* 2. Search Bar: Exact 28px height matching Browse button, keeping signature green border */}
      <div className="mx-auto mb-8 flex h-[28px] w-full max-w-[672px] items-center">
        <div className="relative h-[28px] w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-[12px] -translate-y-1/2 text-white sm:left-4" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[28px] w-full rounded-md border border-[#D9E800] bg-black pl-8 pr-8 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-[28px] text-white placeholder:text-white/80 focus:outline-none sm:pl-10 sm:pr-10 sm:text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white transition-colors hover:text-[#D9E800] sm:right-4"
              aria-label="Clear search"
            >
              <X className="size-[12px]" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Horizontal Tag Pills Bar & Toolbar */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/20 pb-4">
        {/* Scrollable Tag Pills (Same design token as video tags) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* 'All' pill */}
          <button
            onClick={clearAllFilters}
            className={`rounded-sm px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 transition-colors shrink-0 cursor-pointer ${
              activeTags.length === 0 && !searchQuery
                ? "bg-[#D9E800] text-black border border-[#D9E800]"
                : "border border-white/20 bg-black text-white hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black"
            }`}
          >
            All
          </button>

          {/* Curated quick technique pills */}
          {QUICK_TAGS.map((tag) => {
            const isSelected = activeTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`rounded-sm px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 transition-colors shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#D9E800] text-black border border-[#D9E800]"
                    : "border border-white/20 bg-black text-white hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black"
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>

        {/* Right side controls: Count & Grid density switcher */}
        <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
          {/* Results Count */}
          <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-white/80">
            {loading
              ? "Loading..."
              : `${filteredVideos.length} ${
                  filteredVideos.length === 1 ? "video" : "videos"
                }`}
          </span>

          {/* Minimalist Grid Column Switcher: 2 / 3 / 4 columns */}
          <div className="hidden sm:inline-flex items-center rounded-sm border border-white/20 bg-black p-0.5 gap-0.5">
            {/* 2 Columns: || */}
            <button
              onClick={() => handleSetGridCols(2)}
              className={`flex h-6 items-center justify-center rounded-[2px] px-2 font-['JetBrains_Mono'] text-xs transition-colors ${
                gridCols === 2
                  ? "bg-[#D9E800] font-bold text-black"
                  : "text-white/60 hover:text-white"
              }`}
              title="2 columns view"
              aria-label="2 columns view"
            >
              ||
            </button>

            {/* 3 Columns: ||| */}
            <button
              onClick={() => handleSetGridCols(3)}
              className={`flex h-6 items-center justify-center rounded-[2px] px-2 font-['JetBrains_Mono'] text-xs transition-colors ${
                gridCols === 3
                  ? "bg-[#D9E800] font-bold text-black"
                  : "text-white/60 hover:text-white"
              }`}
              title="3 columns view"
              aria-label="3 columns view"
            >
              |||
            </button>

            {/* 4 Columns: |||| */}
            <button
              onClick={() => handleSetGridCols(4)}
              className={`flex h-6 items-center justify-center rounded-[2px] px-2 font-['JetBrains_Mono'] text-xs transition-colors ${
                gridCols === 4
                  ? "bg-[#D9E800] font-bold text-black"
                  : "text-white/60 hover:text-white"
              }`}
              title="4 columns view (dense)"
              aria-label="4 columns view"
            >
              ||||
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips (if any custom search or tag applied) */}
      {(activeTags.length > 0 || searchQuery) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-white/60 font-['JetBrains_Mono']">
            Filtered:
          </span>
          {activeTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="flex items-center space-x-1.5 rounded-sm border border-[#D9E800] bg-[#D9E800] px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm text-black transition-opacity hover:opacity-90"
            >
              <span>{tag}</span>
              <X className="size-3.5" />
            </button>
          ))}
          {searchQuery && (
            <span className="rounded-sm border border-white/20 bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm text-white">
              Search: &quot;{searchQuery}&quot;
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs uppercase tracking-wider text-white underline hover:text-[#D9E800] font-['JetBrains_Mono'] ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Dynamic Video Grid */}
      {error ? (
        <div className="py-20 text-center">
          <p className="text-lg text-white">{error}</p>
        </div>
      ) : visibleVideos.length > 0 ? (
        <>
          <div className={gridClass}>
            {visibleVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onTagClick={handleTagClick}
              />
            ))}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-12">
              <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-widest text-white/60">
                Loading more...
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center">
          {loading ? null : videos.length === 0 ? (
            <p className="font-['JetBrains_Mono'] text-lg text-white">
              No videos in the archive yet.
            </p>
          ) : (
            <>
              <p className="font-['JetBrains_Mono'] text-lg text-white">
                No videos found matching your criteria.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 rounded-sm border border-[#D9E800] bg-[#D9E800] px-6 py-2 font-['JetBrains_Mono'] text-sm uppercase text-black transition-opacity hover:opacity-90"
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      )}

      {/* Portal for Cinema Overlay */}
      <Outlet />
    </div>
  )
}