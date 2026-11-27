import {
  createContext,
  createElement,
  type ReactNode,
  useEffect,
  useContext,
  useState,
} from "react"
import { projectId, publicAnonKey } from "../../../utils/supabase/info"
import type { Video } from "../models/video"
import { assignVideoSlugs } from "../videoSlug"
import { getYouTubeVideoId } from "../youtube"

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function asArray(value: unknown): string[] {
  const parsed = parseJson(value)
  if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
  if (typeof parsed !== "string" || !parsed.trim()) return []
  const unwrapped = parsed.replace(/^\{|\}$/g, "")
  return unwrapped
    .split(",")
    .map((item) => item.trim().replace(/^"|"$/g, ""))
    .filter(Boolean)
}

function asObject(value: unknown): Record<string, any> {
  const parsed = parseJson(value)
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, any>)
    : {}
}

function vimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return match?.[1] ?? null
}

function embedUrl(url: string): string {
  const youtube = getYouTubeVideoId(url)
  if (youtube) {
    const source = new URL(url)
    const embed = new URL(
      `/embed/${encodeURIComponent(youtube)}`,
      "https://www.youtube-nocookie.com",
    )
    source.searchParams.forEach((value, key) => {
      if (key !== "v") embed.searchParams.append(key, value)
    })
    if (typeof window !== "undefined") {
      embed.searchParams.set("origin", window.location.origin)
    }
    return embed.toString()
  }
  const vimeo = vimeoId(url)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}`
  return url
}

function fallbackId(row: Record<string, any>, url: string): string {
  const mediaId = getYouTubeVideoId(url) ?? vimeoId(url)
  if (mediaId) return mediaId
  return String(`${row.artist ?? ""}-${row.song ?? row.title ?? ""}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function normalizeVideo(
  rawRow: Record<string, any>,
): Omit<Video, "slug"> | null {
  // Helper: strips PostgreSQL array braces {} and quotes, cleanly joins director duos/trios
  function cleanText(val: unknown): string | undefined {
    if (!val) return undefined
    if (Array.isArray(val)) {
      const list = val.map(String).map((s) => s.trim()).filter(Boolean)
      return list.length > 0 ? list.join(", ") : undefined
    }
    if (typeof val === "string") {
      const trimmed = val.trim()
      if (!trimmed) return undefined
      // Handle PostgreSQL stringified array syntax: {"Name 1", "Name 2"}
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        const inner = trimmed.slice(1, -1).trim()
        if (!inner) return undefined
        return inner
          .split(",")
          .map((s) => s.replace(/^"|"$/g, "").trim())
          .filter(Boolean)
          .join(", ")
      }
      return trimmed.replace(/^"|"$/g, "").trim()
    }
    return String(val).trim()
  }

  const row = asObject(rawRow.value ?? rawRow.data ?? rawRow)
  const creators = asObject(row.creators)
  const descriptions = asObject(row.descriptions)
  const directUrl = row.videoDirectUrl ?? row.video_direct_url ?? row.url
  const id = row.id ?? row.video_id ?? fallbackId(row, directUrl ?? "")
  const title = row.song ?? row.title
  const artist = row.artist
  const videoUrl = row.videoUrl ?? row.video_url ?? directUrl
  const youtube = getYouTubeVideoId(String(videoUrl ?? ""))

  if (!id || !title || !artist || !videoUrl) return null

  const descriptionEn =
    descriptions.en ??
    row.description_en ??
    row.description_eng ??
    row.descriptionEn ??
    ""
  const descriptionRu =
    descriptions.ru ?? row.description_ru ?? row.descriptionRu ?? ""

  return {
    id: String(id),
    title: String(title),
    artist: String(artist),
    videoUrl: embedUrl(String(videoUrl)),
    videoDirectUrl: directUrl ? String(directUrl) : undefined,
    thumbnail:
      String(row.thumbnail ?? "").trim() ||
      String(row.thumbnail_url ?? "").trim() ||
      (youtube ? `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg` : ""),
    techniques: asArray(row.techniques ?? row.tags).map((tag) =>
      tag.replaceAll("_", " "),
    ),
    creators: {
      director: cleanText(creators.director ?? row.director),
      productionCompany: cleanText(
        creators.productionCompany ??
          creators.production_company ??
          row.productionCompany ??
          row.production_company,
      ),
      dop: cleanText(creators.dop ?? row.dop),
    },
    decade: asArray(row.decade ?? row.era)[0] ?? "",
    descriptions:
      descriptionEn || descriptionRu
        ? { en: String(descriptionEn), ru: String(descriptionRu) }
        : undefined,
    links: parseJson(row.links) as Video["links"],
    media: parseJson(row.media) as Video["media"],
  }
}

interface VideoArchiveState {
  videos: Video[]
  loading: boolean
  error: string | null
}

const VideoArchiveContext = createContext<VideoArchiveState | undefined>(undefined)

export function VideoArchiveProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadVideos() {
      try {
        const tableName = "sample10"
        const endpoint = `https://${projectId}.supabase.co/rest/v1/${tableName}?select=*`
        
        const response = await fetch(endpoint, {
          headers: {
            apikey: publicAnonKey,
            Authorization: `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal,
        })

        if (!response.ok) throw new Error("Could not load the video archive")

        const payload = await response.json()
        const normalized = (Array.isArray(payload) ? payload : payload.videos ?? [])
          .map(normalizeVideo)
          .filter(
            (video): video is Omit<Video, "slug"> => video !== null,
          )

        setVideos(assignVideoSlugs(normalized))
        setLoading(false)
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load the video archive",
        )
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadVideos()
    return () => controller.abort()
  }, [])

  return createElement(
    VideoArchiveContext.Provider,
    { value: { videos, loading, error } },
    children,
  )
}

export function useVideoArchive() {
  const context = useContext(VideoArchiveContext)
  if (!context) {
    throw new Error("useVideoArchive must be used within VideoArchiveProvider")
  }
  return context
}
