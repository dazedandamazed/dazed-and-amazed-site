# Reset + UX Improvements Plan

## Context

Clear all video and thought entries, keep structure/design/about/photo. Fix two UX issues: lazy-load video players, and add shuffle + infinite scroll to the home grid.

Content will be re-added separately by the user uploading files later.

---

## Step 1 — Clear data files

**`src/app/data/videos.ts`**
- Keep the `Video` interface export unchanged
- Set `export const videos: Video[] = [];` — empty array, delete all entries

**`src/app/data/thoughts.ts`**
- Keep the `Thought` interface export unchanged
- Set `export const thoughts: Thought[] = [];` — empty array, delete all entries

---

## Step 2 — Lazy-load video players

**`src/app/components/VideoCard.tsx`**
- Add `useState` for `playing` boolean, default `false`
- When `playing === false`: render `<img src={thumbnail}>` inside the 16:9 container with a centered play button overlay (white circle + black triangle icon)
- When `playing === true`: render `<iframe src={videoUrl + "&autoplay=1"}>` — iframe only mounts on click
- Hover on thumbnail: slight opacity darkening (`hover:opacity-80` or similar)
- This eliminates all iframe network requests on page load

---

## Step 3 — Home.tsx: shuffle + infinite scroll

**`src/app/components/Home.tsx`**
- Add `useRef` to imports; add `Video` type import from `../data/videos`
- `baseList` state: on mount, Fisher-Yates shuffle `videos` into `baseList` (new random order every page visit, no sessionStorage)
- `filteredVideos` useMemo: filter from `baseList` (not static `videos`)
- `visibleCount` state: starts at 12, resets to 12 whenever search or active tags change
- IntersectionObserver on a sentinel `<div ref={sentinelRef}>` at bottom of grid: appends +12 to `visibleCount` when sentinel enters viewport within 400px
- Render `visibleVideos = filteredVideos.slice(0, visibleCount)`
- Show sentinel only when `visibleCount < filteredVideos.length`
- Count line: `"{total} videos — showing {visible}"` when paginated, just `"{total} videos"` when all visible

---

## What stays untouched

- All routing, header, footer, logo, design tokens, fonts
- About section and Polina's photo
- `VideoDetail.tsx`, `Root.tsx`, `App.tsx`, all other components
