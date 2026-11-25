import { getYouTubeVideoId } from "./youtube"

const thumbnailCache = new Map<string, Promise<string | null>>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function secureThumbnail(value: unknown): string | null {
  if (typeof value !== "string") return null

  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function isVimeoUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return hostname === "vimeo.com" || hostname.endsWith(".vimeo.com")
  } catch {
    return false
  }
}

function vimeoVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!isVimeoUrl(url)) return null
    return parsed.pathname.match(/\/(?:video\/)?(\d+)(?:\/|$)/)?.[1] ?? null
  } catch {
    return null
  }
}

function requestThumbnail(
  key: string,
  endpoint: URL,
  provider: string,
): Promise<string | null> {
  const cached = thumbnailCache.get(key)
  if (cached) return cached

  const request = (async () => {
    try {
      const response = await fetch(endpoint)
      if (!response.ok) {
        if (response.status >= 500) {
          console.warn(`${provider} thumbnail lookup failed with HTTP ${response.status}`)
        }
        return null
      }

      const payload: unknown = await response.json()
      return isRecord(payload) ? secureThumbnail(payload.thumbnail_url) : null
    } catch (error) {
      console.warn(`${provider} thumbnail lookup failed`, error)
      return null
    }
  })()

  thumbnailCache.set(key, request)
  return request
}

function getVimeoThumbnail(url: string): Promise<string | null> {
  const videoId = vimeoVideoId(url)
  const sourceUrl = videoId ? `https://vimeo.com/${videoId}` : url
  const endpoint = new URL("https://vimeo.com/api/oembed.json")
  endpoint.searchParams.set("url", sourceUrl)
  return requestThumbnail(`vimeo:${sourceUrl}`, endpoint, "Vimeo")
}

function getYouTubeThumbnail(url: string): Promise<string | null> {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return Promise.resolve(null)

  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
  const endpoint = new URL("https://www.youtube.com/oembed")
  endpoint.searchParams.set("url", watchUrl)
  endpoint.searchParams.set("format", "json")
  return requestThumbnail(`youtube:${videoId}`, endpoint, "YouTube")
}

export async function getVideoSourceThumbnail(
  urls: string[],
): Promise<string | null> {
  const vimeoUrl = urls.find(isVimeoUrl)
  if (vimeoUrl) return getVimeoThumbnail(vimeoUrl)

  const youtubeUrl = urls.find((url) => getYouTubeVideoId(url) !== null)
  return youtubeUrl ? getYouTubeThumbnail(youtubeUrl) : null
}
