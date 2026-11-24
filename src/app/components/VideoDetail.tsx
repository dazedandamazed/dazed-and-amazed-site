import { useParams, useNavigate, Link } from "react-router"
import {
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { useVideoArchive } from "../hooks/useVideoArchive"

// Helper: renders text with markdown-style links [text](url) in brand green
function FormattedDescription({ text }: { text: string }) {
  const parts = useMemo(() => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const elements: (string | { text: string; url: string; key: number })[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null
    let key = 0

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index))
      }
      elements.push({ text: match[1], url: match[2], key: key++ })
      lastIndex = linkRegex.lastIndex
    }

    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex))
    }

    return elements
  }, [text])

  return (
    <>
      {parts.map((part) => {
        if (typeof part === "string") {
          return part
        }

        const isInternal = part.url.startsWith("/") || part.url.startsWith("?")
        if (isInternal) {
          return (
            <Link
              key={part.key}
              to={part.url}
              className="text-[#D9E800] underline underline-offset-4 transition-opacity hover:opacity-80 active:opacity-70"
            >
              {part.text}
            </Link>
          )
        }

        return (
          <a
            key={part.key}
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D9E800] underline underline-offset-4 transition-opacity hover:opacity-80 active:opacity-70"
          >
            {part.text}
          </a>
        )
      })}
    </>
  )
}

export function VideoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const { videos, loading, error } = useVideoArchive()
  const [playbackError, setPlaybackError] = useState(false)

  const currentIndex = useMemo(() => {
    return videos.findIndex((v) => v.id === id)
  }, [videos, id])

  const video = videos[currentIndex]

  // Reset error state when video changes
  useEffect(() => {
    setPlaybackError(false)
  }, [id])

  // Listen for YouTube/Vimeo error postMessages
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data
        if (
          data?.event === "onError" ||
          data?.info === 101 ||
          data?.info === 150 ||
          data?.info === 100
        ) {
          setPlaybackError(true)
        }
      } catch {
        // Non-JSON message from external scripts
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [id])

  const prevVideo = useMemo(() => {
    if (videos.length <= 1 || currentIndex === -1) return null
    return currentIndex > 0 ? videos[currentIndex - 1] : videos[videos.length - 1]
  }, [videos, currentIndex])

  const nextVideo = useMemo(() => {
    if (videos.length <= 1 || currentIndex === -1) return null
    return currentIndex < videos.length - 1 ? videos[currentIndex + 1] : videos[0]
  }, [videos, currentIndex])

  const handleClose = () => {
    navigate("/")
  }

  const goToPrev = () => {
    if (prevVideo) navigate(`/video/${prevVideo.id}`, { replace: true })
  }

  const goToNext = () => {
    if (nextVideo) navigate(`/video/${nextVideo.id}`, { replace: true })
  }

  // Lock background scroll while overlay is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  // Keyboard navigation: Esc (close), ← (prev), → (next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
      if (e.key === "ArrowLeft" && prevVideo) {
        navigate(`/video/${prevVideo.id}`, { replace: true })
      }
      if (e.key === "ArrowRight" && nextVideo) {
        navigate(`/video/${nextVideo.id}`, { replace: true })
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [prevVideo, nextVideo])

  if (loading) {
    return (
      <div className="fixed inset-x-0 bottom-0 top-20 z-40 flex items-center justify-center bg-black/95 backdrop-blur-md xl:top-[100px]">
        <p className="font-['JetBrains_Mono'] text-white">Loading video...</p>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="fixed inset-x-0 bottom-0 top-20 z-40 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md xl:top-[100px]">
        <div className="text-center">
          <h2 className="mb-4 font-['JetBrains_Mono'] text-2xl text-white">
            {error ? "Could not load video" : "Video not found"}
          </h2>
          <button
            onClick={handleClose}
            className="text-white underline hover:text-[#D9E800]"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const description = video.descriptions?.[language]

  const handleTagClick = (tag: string) => {
    navigate(`/?filter=${encodeURIComponent(tag)}`)
  }

  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return rawUrl
    try {
      let cleanUrl = rawUrl.replace("youtube-nocookie.com", "youtube.com")
      const parsed = new URL(cleanUrl)
      if (parsed.hostname.includes("youtube.com")) {
        parsed.searchParams.set("enablejsapi", "1")
        if (typeof window !== "undefined") {
          parsed.searchParams.set("origin", window.location.origin)
          parsed.searchParams.set("widget_referrer", window.location.origin)
        }
      }
      return parsed.toString()
    } catch {
      return rawUrl
    }
  }

  const isVimeo =
    video.platform?.toLowerCase() === "vimeo" ||
    video.videoUrl?.includes("vimeo.com")

  const fallbackText = isVimeo
    ? "The creator restricted playback here. Guess we have to watch it on Vimeo"
    : "The label blocked playback here. Guess we have to watch it on YouTube"

  return (
    // Overlay positioned directly below persistent main header
    <div
      onClick={handleClose}
      className="fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto bg-black/95 backdrop-blur-md transition-opacity duration-200 xl:top-[100px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="min-h-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
      >
        <div className="mx-auto max-w-5xl">
          {/* Top Control Bar: Strictly pure controls [ ‹ ] [ › ] [ ✕ ] */}
          <div className="mb-6 flex items-center justify-end gap-2 border-b border-white/10 pb-4">
            {/* Prev Video Button */}
            {prevVideo && (
              <button
                onClick={goToPrev}
                className="inline-flex size-8 items-center justify-center rounded-md border border-white/20 bg-black text-white transition-colors hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black"
                title="Previous video (←)"
                aria-label="Previous video"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}

            {/* Next Video Button */}
            {nextVideo && (
              <button
                onClick={goToNext}
                className="inline-flex size-8 items-center justify-center rounded-md border border-white/20 bg-black text-white transition-colors hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black"
                title="Next video (→)"
                aria-label="Next video"
              >
                <ChevronRight className="size-4" />
              </button>
            )}

            {/* Dedicated Close Button */}
            <button
              onClick={handleClose}
              className="inline-flex size-8 items-center justify-center rounded-md border border-white/20 bg-black text-white transition-colors hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black"
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Video Player */}
          <div className="mb-8 sm:mb-10">
            <div className="relative mb-3 aspect-video overflow-hidden rounded-sm bg-black sm:mb-4">
              <iframe
                src={getEmbedUrl(video.videoUrl)}
                title={`${video.artist} - ${video.title}`}
                className="block size-full border-0 outline-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            {/* Fallback notice: rendered ONLY when playback is blocked */}
            {(playbackError || !video.videoUrl) && video.videoDirectUrl && (
              <div className="pt-1 text-center animate-in fade-in duration-300">
                <a
                  href={video.videoDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm text-[#D9E800] transition-opacity hover:opacity-80 active:opacity-70"
                >
                  <span>{fallbackText}</span>
                  <ExternalLink className="ml-1 inline size-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Video Info Section */}
          <div className="space-y-6 sm:space-y-8">
            {/* Bold, Cinematic Editorial Title & Artist */}
            <div>
              <h1 className="font-['JetBrains_Mono'] text-3xl font-extrabold uppercase leading-[1.05] tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                {video.title}
              </h1>
              <button
                onClick={() => handleTagClick(video.artist)}
                className="mt-2.5 block cursor-pointer text-left font-['Kommuna_Demo'] text-[30px] font-normal leading-[1.1] text-white transition-colors hover:text-[#D9E800] active:text-[#D9E800] sm:mt-3.5 sm:text-[36px] lg:text-[42px]"
                title={`Filter by ${video.artist}`}
              >
                {video.artist}
              </button>
            </div>

            {/* Description with Markdown link support */}
            {description && (
              <div className="max-w-3xl">
                <p
                  lang={language}
                  className="whitespace-pre-line text-sm leading-relaxed text-white sm:text-base sm:leading-relaxed"
                >
                  <FormattedDescription text={description} />
                </p>
              </div>
            )}

            {/* External Sources Links */}
            {video.links && video.links.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-col items-start gap-2">
                  {video.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-white transition-colors hover:text-[#D9E800] active:text-[#D9E800] sm:text-sm"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="size-3 sm:size-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tag Categories with matching spacing scale */}
            <div className="space-y-2.5 sm:space-y-3">
              {/* Techniques */}
              {video.techniques && video.techniques.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {video.techniques.map((technique) => (
                    <button
                      key={technique}
                      onClick={() => handleTagClick(technique)}
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
                      onClick={() => handleTagClick(video.creators.director!)}
                      className="rounded-sm border border-white/20 bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 text-white transition-colors hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black"
                    >
                      Dir: {video.creators.director}
                    </button>
                  )}
                  {video.creators.productionCompany && (
                    <button
                      onClick={() =>
                        handleTagClick(video.creators.productionCompany!)
                      }
                      className="rounded-sm border border-white/20 bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 text-white transition-colors hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black"
                    >
                      Prod: {video.creators.productionCompany}
                    </button>
                  )}
                  {video.creators.dop && (
                    <button
                      onClick={() => handleTagClick(video.creators.dop!)}
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
                    onClick={() => handleTagClick(video.decade)}
                    className="rounded-sm border border-white/20 bg-black px-3 py-1 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm leading-5 text-white transition-colors hover:border-[#D9E800] hover:bg-[#D9E800] hover:text-black active:border-[#D9E800] active:bg-[#D9E800] active:text-black"
                  >
                    {video.decade}
                  </button>
                </div>
              )}
            </div>

            {/* Media Section: Stills, GIFs, BTS */}
            {video.media &&
              (video.media.stills || video.media.gifs || video.media.bts) && (
                <div className="border-t border-white/20 pt-6 sm:pt-8">
                  <h2 className="mb-4 font-['JetBrains_Mono'] text-xl text-white sm:mb-6 sm:text-2xl">
                    Media & Behind the Scenes
                  </h2>

                  {/* Stills */}
                  {video.media.stills && video.media.stills.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                        {video.media.stills.map((still) => (
                          <figure key={still.src} className="space-y-1.5">
                            <img
                              src={still.src}
                              alt={still.alt}
                              className="h-auto w-full rounded border border-white/20"
                            />
                            {still.sourceUrl && (
                              <a
                                href={still.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-white transition-colors hover:text-[#D9E800] active:text-[#D9E800]"
                              >
                                <span>Original post</span>
                                <ExternalLink className="size-3" />
                              </a>
                            )}
                          </figure>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GIFs */}
                  {video.media.gifs && video.media.gifs.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                        {video.media.gifs.map((gif, index) => (
                          <img
                            key={index}
                            src={gif}
                            alt={`GIF ${index + 1}`}
                            className="aspect-video w-full rounded border border-white/20 object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BTS */}
                  {video.media.bts && video.media.bts.length > 0 && (
                    <div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                        {video.media.bts.map((btsItem, index) => (
                          <img
                            key={index}
                            src={btsItem}
                            alt={`BTS ${index + 1}`}
                            className="aspect-video w-full rounded border border-white/20 object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Footer inside video view */}
          <footer className="mt-16 border-t border-white/10 pt-10 pb-16 sm:mt-24 sm:pt-12 sm:pb-20">
            <div className="mx-auto flex max-w-7xl flex-col items-center px-4">
              <div className="mb-4 flex h-[34px] items-center gap-6">
                <a
                  href="https://instagram.com/dazed_amazed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white transition-colors hover:text-[#D9E800]"
                  aria-label="Instagram"
                >
                  <img src="/assets/instagram.svg" alt="" width="30" height="30" />
                </a>
                <a
                  href="https://t.me/dazedandamazed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white transition-colors hover:text-[#D9E800]"
                  aria-label="Telegram"
                >
                  <img src="/assets/telegram.svg" alt="" width="30" height="30" />
                </a>
                <a
                  href="https://youtube.com/@dazed.and.amazed?si=UdiTpnLe1S9a9diK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white transition-colors hover:text-[#D9E800]"
                  aria-label="YouTube"
                >
                  <img src="/assets/youtube.svg" alt="" width="35" height="30" />
                </a>
              </div>
              <p className="text-center text-sm leading-5 text-white">
                A curated collection of music videos with top-tier craft and direction.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}