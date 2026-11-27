import type { Video } from "./models/video"

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
}

export function assignVideoSlugs(
  videos: Omit<Video, "slug">[],
): Video[] {
  const titleSlugs = videos.map(
    (video) =>
      slugify(video.title) ||
      slugify(video.artist) ||
      slugify(video.id) ||
      "video",
  )
  const titleSlugCounts = new Map<string, number>()

  titleSlugs.forEach((slug) => {
    titleSlugCounts.set(slug, (titleSlugCounts.get(slug) ?? 0) + 1)
  })

  const candidates = videos.map((video, index) => {
    const titleSlug = titleSlugs[index]
    if (titleSlugCounts.get(titleSlug) === 1) return titleSlug

    return `${titleSlug}-${slugify(video.artist) || slugify(video.id) || index + 1}`
  })
  const candidateCounts = new Map<string, number>()

  candidates.forEach((slug) => {
    candidateCounts.set(slug, (candidateCounts.get(slug) ?? 0) + 1)
  })

  const usedSlugs = new Set<string>()

  return videos.map((video, index) => {
    const candidate = candidates[index]
    let slug =
      candidateCounts.get(candidate) === 1
        ? candidate
        : `${candidate}-${slugify(video.id) || index + 1}`
    let suffix = 2

    while (usedSlugs.has(slug)) {
      slug = `${candidate}-${slugify(video.id) || index + 1}-${suffix}`
      suffix += 1
    }

    usedSlugs.add(slug)
    return { ...video, slug }
  })
}

export function getVideoPath(video: Pick<Video, "slug">): string {
  return `/video/${encodeURIComponent(video.slug)}`
}
