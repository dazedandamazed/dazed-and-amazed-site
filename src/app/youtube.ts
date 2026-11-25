export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()

    if (hostname === "youtu.be" || hostname === "www.youtu.be") {
      return parsed.pathname.split("/")[1] ?? null
    }

    const isYouTubeHost =
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com") ||
      hostname === "youtube-nocookie.com" ||
      hostname.endsWith(".youtube-nocookie.com")

    if (!isYouTubeHost) return null

    return (
      parsed.searchParams.get("v") ??
      parsed.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1] ??
      null
    )
  } catch {
    return null
  }
}

export function getYouTubeWatchUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url)
  return videoId
    ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
    : null
}
