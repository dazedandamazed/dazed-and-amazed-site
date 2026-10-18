import { useParams, useNavigate, Link } from "react-router"
import { ExternalLink, ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { useVideoArchive } from "../hooks/useVideoArchive"
import { LanguageToggle } from "./LanguageToggle"

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
      {parts.map((part, index) => {
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

  // Reset playback error state when video changes
  useEffect(() => {
    setPlaybackError(false)
  }, [id])

  // Listen for YouTube/Vimeo error postMessages from iframe
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

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
        <p className="font-['JetBrains_Mono'] text-white">Loading video...</p>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
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
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md transition-opacity duration-200"
    >
      {/* Previous video arrow */}
      {prevVideo && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToPrev()
          }}
          className="fixed left-2 top-1/2 -translate-y-1/2 z-50 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-[#D9E800] active:text-[#D9E800] sm:left-6 sm:p-3"
          aria-label="Previous video"
          title="Previous (←)"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Next video arrow */}
      {nextVideo && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            goToNext()
          }}
          className="fixed right-2 top-1/2 -translate-y-1/2 z-50 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-[#D9E800] active:text-[#D9E800] sm:right-6 sm:p-3"
          aria-label="Next video"
          title="Next (→)"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Modal Card Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="min-h-screen px-4 py-8 sm:px-12 lg:px-16"
      >
        <div className="mx-auto max-w-5xl">
          {/* Header Bar */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="flex items-center space-x-2 text-white transition-colors hover:text-[#D9E800] active:text-[#D9E800]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-['JetBrains_Mono'] text-sm uppercase tracking-wider">
                Back to archive
              </span>
            </button>

            <div className="flex items-center space-x-6">
              <LanguageToggle />

              <button
                onClick={handleClose}
                className="rounded p-2 text-white transition-colors hover:bg-white/10 hover:text-[#D9E800] active:text-[#D9E800]"
                aria-label="Close"
                title="Close (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Video Player (Clean black box, no white border artifact) */}
          <div className="mb-8">
            <div className="relative aspect-video bg-black rounded-sm overflow-hidden mb-4">
              <iframe
                src={getEmbedUrl(video.videoUrl)}
                title={`${video.artist} - ${video.title}`}
                className="w-full h-full border-0 outline-none block"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            {/* Fallback notice: rendered ONLY when playback error is detected */}
            {(playbackError || !video.videoUrl) && video.videoDirectUrl && (
              <div className="text-center pt-1 animate-in fade-in duration-300">
                <a
                  href={video.videoDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm text-[#D9E800] transition-opacity hover:opacity-80 active:opacity-70"
                >
                  <span>{fallbackText}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 inline" />
                </a>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="space-y-6">
            {/* Title & Clickable Artist */}
            <div>
              <h1 className="mb-2 font-['JetBrains_Mono'] text-2xl font-extrabold uppercase leading-7 tracking-[-0.36px] text-white sm:text-3xl">
                {video.title}
              </h1>
              <button
                onClick={() => handleTagClick(video.artist)}
                className="block text-left font-['Kommuna_Demo'] text-[28px] font-normal leading-[33px] text-white transition-colors hover:text-[#D9E800] active:text-[#D9E800] cursor-pointer"
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
                  className="whitespace-pre-line leading-relaxed text-white text-base sm:text-lg"
                >
                  <FormattedDescription text={description} />
                </p>
              </div>
            )}

            {/* Sources */}
            {video.links && video.links.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-col items-start gap-2">
                  {video.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-white transition-colors hover:text-[#D9E800] active:text-[#D9E800]"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Row 1: Techniques */}
            {video.techniques && video.techniques.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {video.techniques.map((technique) => (
                  <button
                    key={technique}
                    onClick={() => handleTagClick(technique)}
                    className="rounded-sm bg-black border border-white/20 px-3 py-1.5 text-sm leading-5 text-white transition-colors hover:bg-[#D9E800] hover:text-black hover:border-[#D9E800] active:bg-[#D9E800] active:text-black active:border-[#D9E800]"
                  >
                    {technique}
                  </button>
                ))}
              </div>
            )}

            {/* Tags Row 2: Creators */}
            {video.creators && (
              <div className="flex flex-wrap gap-2">
                {video.creators.director && (
                  <button
                    onClick={() => handleTagClick(video.creators.director!)}
                    className="rounded-sm bg-black border border-white/20 px-3 py-1.5 text-sm leading-5 text-white transition-colors hover:bg-[#D9E800] hover:text-black hover:border-[#D9E800] active:bg-[#D9E800] active:text-black active:border-[#D9E800]"
                  >
                    Dir: {video.creators.director}
                  </button>
                )}
                {video.creators.productionCompany && (
                  <button
                    onClick={() =>
                      handleTagClick(video.creators.productionCompany!)
                    }
                    className="rounded-sm bg-black border border-white/20 px-3 py-1.5 text-sm leading-5 text-white transition-colors hover:bg-[#D9E800] hover:text-black hover:border-[#D9E800] active:bg-[#D9E800] active:text-black active:border-[#D9E800]"
                  >
                    Prod: {video.creators.productionCompany}
                  </button>
                )}
                {video.creators.dop && (
                  <button
                    onClick={() => handleTagClick(video.creators.dop!)}
                    className="rounded-sm bg-black border border-white/20 px-3 py-1.5 text-sm leading-5 text-white transition-colors hover:bg-[#D9E800] hover:text-black hover:border-[#D9E800] active:bg-[#D9E800] active:text-black active:border-[#D9E800]"
                  >
                    DOP: {video.creators.dop}
                  </button>
                )}
              </div>
            )}

            {/* Tags Row 3: Decade */}
            {video.decade && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTagClick(video.decade)}
                  className="rounded-sm bg-black border border-white/20 px-3 py-1.5 text-sm leading-5 text-white transition-colors hover:bg-[#D9E800] hover:text-black hover:border-[#D9E800] active:bg-[#D9E800] active:text-black active:border-[#D9E800]"
                >
                  {video.decade}
                </button>
              </div>
            )}

            {/* Media Section */}
            {video.media &&
              (video.media.stills || video.media.gifs || video.media.bts) && (
                <div className="border-t border-white/20 pt-8">
                  <h2 className="mb-6 font-['JetBrains_Mono'] text-2xl text-white">
                    Media & Behind the Scenes
                  </h2>

                  {/* Stills */}
                  {video.media.stills && video.media.stills.length > 0 && (
                    <div className="mb-8">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {video.media.stills.map((still) => (
                          <figure key={still.src} className="space-y-2">
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
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </figure>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GIFs */}
                  {video.media.gifs && video.media.gifs.length > 0 && (
                    <div className="mb-8">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
        </div>
      </div>
    </div>
  )
}