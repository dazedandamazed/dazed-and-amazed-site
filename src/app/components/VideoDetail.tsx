import { useParams, useNavigate, Link } from "react-router"
import {
  Share2,
  Twitter,
  Facebook,
  Link as LinkIcon,
  ExternalLink,
  ArrowLeft,
} from "lucide-react"
import { useState } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { useVideoArchive } from "../hooks/useVideoArchive"

export function VideoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showShareMenu, setShowShareMenu] = useState(false)
  const { language } = useLanguage()
  const { videos, loading, error } = useVideoArchive()

  const video = videos.find((v) => v.id === id)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-white">Loading video...</p>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-['JetBrains_Mono'] mb-4">
            {error ? "Could not load video" : "Video not found"}
          </h2>
          <Link to="/" className="text-white underline hover:text-[#D9E800]">
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  const videoPageUrl = `${window.location.origin}/video/${video.id}`
  const description = video.descriptions?.[language]

  const shareToTwitter = () => {
    const text = `Check out ${video.title} by ${video.artist}`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(videoPageUrl)}`,
      "_blank",
    )
  }

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoPageUrl)}`,
      "_blank",
    )
  }

  const copyLink = () => {
    navigator.clipboard.writeText(videoPageUrl)
    alert("Link copied to clipboard!")
  }

  const handleTagClick = (tag: string) => {
    // Navigate to home with tag filter
    navigate(`/?filter=${encodeURIComponent(tag)}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center space-x-2 text-white transition-colors hover:text-[#D9E800]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Video Player */}
      <div className="mb-8">
        <div className="relative aspect-video bg-black rounded-sm overflow-hidden mb-4">
          <iframe
            src={video.videoUrl}
            title={`${video.artist} - ${video.title}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        {/* Fallback link in case of embed issues */}
        {video.videoDirectUrl && (
          <div className="text-center">
            <a
              href={video.videoDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-sm text-white transition-colors hover:text-[#D9E800]"
            >
              <span>Can't see the video? Watch source video</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="space-y-6">
        {/* Title and Share */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 font-['JetBrains_Mono'] text-2xl font-extrabold uppercase leading-7 tracking-[-0.36px]">
              {video.title}
            </h1>
            <p className="font-['Kommuna_Demo'] text-[28px] font-normal leading-[33px] text-white">
              {video.artist}
            </p>
          </div>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="rounded p-3 transition-colors hover:bg-white hover:text-black"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {showShareMenu && (
              <div className="absolute right-0 z-10 mt-2 min-w-[140px] space-y-1 rounded border border-white bg-black p-2 shadow-lg">
                <button
                  onClick={shareToTwitter}
                  className="flex w-full items-center space-x-2 rounded px-3 py-2 text-sm hover:bg-white hover:text-black"
                >
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </button>
                <button
                  onClick={shareToFacebook}
                  className="flex w-full items-center space-x-2 rounded px-3 py-2 text-sm hover:bg-white hover:text-black"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={copyLink}
                  className="flex w-full items-center space-x-2 rounded px-3 py-2 text-sm hover:bg-white hover:text-black"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="max-w-3xl">
            <p
              lang={language}
              className="whitespace-pre-line leading-relaxed text-white"
            >
              {description}
            </p>
          </div>
        )}

        {/* Sources and Further Reading */}
        {video.links && video.links.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-white">
              Sources & Further Reading
            </p>
            <div className="flex flex-col items-start gap-2">
              {video.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white transition-colors hover:text-[#D9E800]"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Tags Row 1: Techniques */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-white">
            Techniques / Concepts
          </p>
          <div className="flex flex-wrap gap-2">
            {video.techniques.map((technique) => (
              <button
                key={technique}
                onClick={() => handleTagClick(technique)}
                className="rounded-sm bg-black px-3 py-1.5 text-sm leading-5 transition-colors hover:bg-[#D9E800] hover:text-black"
              >
                {technique}
              </button>
            ))}
          </div>
        </div>

        {/* Tags Row 2: Creators */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-white">
            Production Credits
          </p>
          <div className="flex flex-wrap gap-2">
            {video.creators.director && (
              <button
                onClick={() => handleTagClick(video.creators.director!)}
                className="rounded-sm bg-black px-3 py-1.5 text-sm leading-5 transition-colors hover:bg-[#D9E800] hover:text-black"
              >
                Dir: {video.creators.director}
              </button>
            )}
            {video.creators.productionCompany && (
              <button
                onClick={() =>
                  handleTagClick(video.creators.productionCompany!)
                }
                className="rounded-sm bg-black px-3 py-1.5 text-sm leading-5 transition-colors hover:bg-[#D9E800] hover:text-black"
              >
                Prod: {video.creators.productionCompany}
              </button>
            )}
            {video.creators.dop && (
              <button
                onClick={() => handleTagClick(video.creators.dop!)}
                className="rounded-sm bg-black px-3 py-1.5 text-sm leading-5 transition-colors hover:bg-[#D9E800] hover:text-black"
              >
                DOP: {video.creators.dop}
              </button>
            )}
          </div>
        </div>

        {/* Tags Row 3: Decade */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-white">
            Era
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTagClick(video.decade)}
              className="rounded-sm bg-black px-3 py-1.5 text-sm leading-5 transition-colors hover:bg-[#D9E800] hover:text-black"
            >
              {video.decade}
            </button>
          </div>
        </div>

        {/* Media Section: Stills, GIFs, BTS */}
        {video.media &&
          (video.media.stills || video.media.gifs || video.media.bts) && (
            <div className="border-t border-white pt-8">
              <h2 className="text-2xl font-['JetBrains_Mono'] mb-6">
                Media & Behind the Scenes
              </h2>

              {/* Stills */}
              {video.media.stills && video.media.stills.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-3 text-sm uppercase tracking-wider text-white">
                    Video Stills
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {video.media.stills.map((still) => (
                      <figure key={still.src} className="space-y-2">
                        <img
                          src={still.src}
                          alt={still.alt}
                          className="h-auto w-full rounded border border-white"
                        />
                        {still.sourceUrl && (
                          <a
                            href={still.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-white transition-colors hover:text-[#D9E800]"
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
                  <h3 className="mb-3 text-sm uppercase tracking-wider text-white">
                    GIFs
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {video.media.gifs.map((gif, index) => (
                      <img
                        key={index}
                        src={gif}
                        alt={`GIF ${index + 1}`}
                        className="aspect-video w-full rounded border border-white object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* BTS */}
              {video.media.bts && video.media.bts.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm uppercase tracking-wider text-white">
                    Behind the Scenes
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {video.media.bts.map((btsItem, index) => (
                      <img
                        key={index}
                        src={btsItem}
                        alt={`BTS ${index + 1}`}
                        className="aspect-video w-full rounded border border-white object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  )
}
