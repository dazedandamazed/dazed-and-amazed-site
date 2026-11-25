import { useState, useMemo, useEffect, useRef } from "react"
import { useSearchParams, Outlet } from "react-router"
import type { Video } from "../models/video"
import { useVideoArchive } from "../hooks/useVideoArchive"
import { VideoCard } from "./VideoCard"
import { Search, X } from "lucide-react"

const ITEMS_PER_PAGE = 16

type GridColumnCount = 2 | 3 | 4 | 5

const thumbnailSizes: Record<GridColumnCount, string> = {
  2: "(min-width: 1536px) calc((100vw - 176px) / 2), (min-width: 1024px) calc((100vw - 144px) / 2), (min-width: 768px) calc((100vw - 96px) / 2), (min-width: 640px) calc(100vw - 64px), calc(100vw - 48px)",
  3: "(min-width: 1536px) calc((100vw - 208px) / 3), (min-width: 1024px) calc((100vw - 176px) / 3), (min-width: 640px) calc((100vw - 88px) / 2), calc(100vw - 48px)",
  4: "(min-width: 1536px) calc((100vw - 224px) / 4), (min-width: 1280px) calc((100vw - 192px) / 4), (min-width: 1024px) calc((100vw - 160px) / 3), (min-width: 640px) calc((100vw - 88px) / 2), calc(100vw - 48px)",
  5: "(min-width: 1536px) calc((100vw - 256px) / 5), (min-width: 1280px) calc((100vw - 192px) / 4), (min-width: 1024px) calc((100vw - 160px) / 3), (min-width: 640px) calc((100vw - 88px) / 2), calc(100vw - 48px)",
}

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
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [baseList, setBaseList] = useState<Video[]>([])
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [placeholder, setPlaceholder] = useState("Search archive")
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 0 : window.innerWidth,
  )
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Grid columns: 2, 3, 4 or 5 columns on massive displays
  const [gridCols, setGridCols] = useState<GridColumnCount>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dazed_grid_cols")
      if (saved === "2" || saved === "3" || saved === "4" || saved === "5") {
        return Number(saved) as 2 | 3 | 4 | 5
      }
    }
    return 3 // Default 3 columns for balanced desktop view
  })

  const maxGridCols: GridColumnCount =
    viewportWidth >= 1536
      ? 5
      : viewportWidth >= 1280
        ? 4
        : viewportWidth >= 1024
          ? 3
          : 2
  const activeGridCols =
    gridCols > maxGridCols ? maxGridCols : gridCols

  const handleSetGridCols = (cols: GridColumnCount) => {
    setGridCols(cols)
    if (typeof window !== "undefined") {
      localStorage.setItem("dazed_grid_cols", String(cols))
    }
  }

  // Show technique tags used by at least three videos.
  const allDynamicTags = useMemo(() => {
    const tagCounts = new Map<string, { label: string; count: number }>()

    videos.forEach((v) => {
      if (Array.isArray(v.techniques)) {
        const videoTags = new Map<string, string>()
        v.techniques.forEach((t) => {
          const cleaned = t.trim()
          const normalized = cleaned.toLowerCase()
          if (normalized && !videoTags.has(normalized)) {
            videoTags.set(normalized, cleaned)
          }
        })

        videoTags.forEach((label, normalized) => {
          const existing = tagCounts.get(normalized)
          if (existing) {
            existing.count += 1
          } else {
            tagCounts.set(normalized, { label, count: 1 })
          }
        })
      }
    })

    return Array.from(tagCounts.values())
      .filter(({ count }) => count >= 3)
      .map(({ label }) => label)
      .sort((a, b) => a.localeCompare(b))
  }, [videos])

  useEffect(() => {
    const updateResponsiveState = () => {
      setViewportWidth(window.innerWidth)
      if (window.innerWidth >= 640) {
        setPlaceholder("Search by title, artist, technique, director...")
      } else {
        setPlaceholder("Search archive")
      }
    }
    updateResponsiveState()
    window.addEventListener("resize", updateResponsiveState)
    return () => window.removeEventListener("resize", updateResponsiveState)
  }, [])

  useEffect(() => {
    setBaseList(shuffle(videos))
  }, [videos])

  useEffect(() => {
    const filter = searchParams.get("filter")
    if (filter) {
      setActiveTags([filter])
    } else {
      setActiveTags([])
    }
  }, [searchParams])

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
  }, [searchQuery, activeTags, baseList])

  // Full-Text Search across all fields including descriptions
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

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < filteredVideos.length) {
          setVisibleCount((n) => Math.min(n + ITEMS_PER_PAGE, filteredVideos.length))
        }
      },
      { rootMargin: "600px" }
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

  // Dynamic Full-Bleed Grid Classes based on Density Switcher
  const gridClass = useMemo(() => {
    if (activeGridCols === 5) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8"
    }
    if (activeGridCols === 4) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
    }
    if (activeGridCols === 3) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10"
    }
    return "grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
  }, [activeGridCols])

  return (
    // FULL-BLEED container across the entire monitor!
    <div className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-14 lg:py-12 2xl:px-20 2xl:py-14">
      {/* Search Bar: 28px height with signature green border */}
      <div className="mx-auto mb-10 flex h-[28px] w-full max-w-[672px] items-center">
        <div className="relative h-[28px] w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-[12px] -translate-y-1/2 text-white sm:left-4" />
          <input
            type="text"
            placeholder={isSearchFocused ? "" : placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="h-[28px] w-full rounded-md border border-[#D9E800] bg-black pl-8 pr-8 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-[28px] text-white placeholder:text-white/50 focus:outline-none sm:pl-10 sm:pr-10 sm:text-base"
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

      {/* 3. Full-Bleed Tag Bar & Grid Switcher spanning the entire screen */}
      <div className="mb-10 flex flex-col gap-4 border-b border-white/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Horizontal Tag Pills (Bleeds freely across the screen) */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar py-1">
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

          {allDynamicTags.map((tag) => {
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

        {/* Minimalist Grid Density Switcher (2 / 3 / 4 / 5 columns) */}
        <div className="hidden shrink-0 items-center gap-0.5 rounded-sm border border-white/20 bg-black p-0.5 md:inline-flex">
          {/* 2 Cols */}
          <button
            onClick={() => handleSetGridCols(2)}
            className={`flex h-6 items-center justify-center rounded-[2px] px-2 font-['JetBrains_Mono'] text-xs transition-colors ${
              activeGridCols === 2
                ? "bg-[#D9E800] font-bold text-black"
                : "text-white/60 hover:text-white"
            }`}
            title="2 columns view"
          >
            ||
          </button>

          {/* 3 Cols */}
          <button
            onClick={() => handleSetGridCols(3)}
            className={`hidden h-6 items-center justify-center rounded-[2px] px-2 font-['JetBrains_Mono'] text-xs transition-colors lg:flex ${
              activeGridCols === 3
                ? "bg-[#D9E800] font-bold text-black"
                : "text-white/60 hover:text-white"
            }`}
            title="3 columns view"
          >
            |||
          </button>

          {/* 4 Cols */}
          <button
            onClick={() => handleSetGridCols(4)}
            className={`hidden h-6 items-center justify-center rounded-[2px] px-2 font-['JetBrains_Mono'] text-xs transition-colors xl:flex ${
              activeGridCols === 4
                ? "bg-[#D9E800] font-bold text-black"
                : "text-white/60 hover:text-white"
            }`}
            title="4 columns view"
          >
            ||||
          </button>

          {/* 5 Cols (EyeCandy Mode for 27" screens) */}
          <button
            onClick={() => handleSetGridCols(5)}
            className={`hidden h-6 items-center justify-center rounded-[2px] px-2 font-['JetBrains_Mono'] text-xs transition-colors 2xl:flex ${
              activeGridCols === 5
                ? "bg-[#D9E800] font-bold text-black"
                : "text-white/60 hover:text-white"
            }`}
            title="5 columns (EyeCandy wide mode)"
          >
            |||||
          </button>
        </div>
      </div>

      {/* Active filters */}
      {(activeTags.length > 0 || searchQuery) && (
        <div className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="mr-1 font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-normal text-white/50">
            Filters
          </span>
          {activeTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              aria-label={`Remove ${tag} filter`}
              className="inline-flex items-center gap-1.5 rounded-sm border border-white/20 bg-white/[0.03] px-2.5 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-xs text-white/80 transition-colors hover:border-[#D9E800] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D9E800]"
            >
              <span>{tag}</span>
              <X className="size-3 text-white/50" />
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search filter"
              className="inline-flex items-center gap-1.5 rounded-sm border border-white/20 bg-white/[0.03] px-2.5 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-xs text-white/80 transition-colors hover:border-[#D9E800] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D9E800]"
            >
              <span className="text-white/50">Search</span>
              <span>&quot;{searchQuery}&quot;</span>
              <X className="size-3 text-white/50" />
            </button>
          )}
          <button
            onClick={clearAllFilters}
            className="ml-1 font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-normal text-white/60 underline-offset-4 hover:text-[#D9E800] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D9E800]"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Wall-to-Wall Immersive Video Grid */}
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
                imageSizes={thumbnailSizes[activeGridCols]}
                onTagClick={handleTagClick}
              />
            ))}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-16">
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
                className="mt-4 rounded-sm border border-[#D9E800] bg-[#D9E800] px-6 py-2 font-['JetBrains_Mono'] text-sm font-bold uppercase tracking-normal text-black transition-opacity hover:opacity-90"
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