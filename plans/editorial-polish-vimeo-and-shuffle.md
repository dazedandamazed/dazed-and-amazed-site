# Editorial polish, Vimeo thumbnails, and faster Shuffle

## Goal

Bring the secondary pages and small interaction details back into the same black editorial language as the Browse experience, while fixing the missing Vimeo preview and eliminating redundant archive requests that make Shuffle feel slow.

Preserve the established brand system:

- Black `#000000`, white `#FFFFFF`, and accent `#D9E800` only for interface chrome.
- JetBrains Mono ExtraBold for headings, navigation, and primary actions.
- Kommuna Demo Narrow for expressive editorial accents.
- Helvetica Neue stack for body copy, labels, fields, and tags.
- Existing Supabase archive endpoint and `youtube-nocookie.com` embeds.
- Existing factual About and Contribute copy, except correcting the stale `TOCHKA` brand reference to `dazed and amazed`.

## Confirmed findings

- Video-card and video-detail tags currently have explicit white borders.
- The video-detail description is inside a rounded white-bordered box.
- Desktop inactive navigation items use `py-2`, while the active item uses `py-[5px]`; the hover background is therefore taller than the active background.
- The provider-specific fallback copy is derived from a simple YouTube/Vimeo check.
- “Death From Above — Virgins” uses `https://vimeo.com/126078148` and has no thumbnail value in Supabase.
- Vimeo’s CORS-enabled oEmbed endpoint returns a valid `i.vimeocdn.com` thumbnail for that URL.
- `Home`, `RandomInspiration`, and `VideoDetail` each call `useVideoArchive`, and the hook currently performs a new archive request on every mount.
- As a result, navigating from Browse to Shuffle discards the already-loaded archive and waits for a second request.
- The Contribute form uses full white rectangular borders and a full-width generic white submit button.
- The About page uses a centered generic heading, bordered portrait, boxed mission statement, and quote divider; these treatments conflict with the otherwise editorial presentation.

## Implementation plan

### 1. Remove stroked tag and description treatments

Update `VideoCard.tsx` and `VideoDetail.tsx`:

- Remove `border`, `border-white`, and hover-border classes from all technique, creator, and decade tag buttons.
- Keep the existing text size, line height, padding, wrapping, click behavior, and three-row grouping.
- Default tags should be borderless black with white text.
- Hover tags should use the existing solid accent background with black text.
- Do not introduce translucent fills or substitute gray backgrounds.
- Remove the rounded border and boxed surface from the video description.
- Present the description as a plain editorial text block with a readable maximum line length and no surrounding stroke.
- Preserve language switching, whitespace handling, and description content.

The active-filter controls on Browse are outside this request and should remain visually distinct from archive tags.

### 2. Make navigation hover and active states geometrically identical

Update desktop navigation in `Root.tsx`:

- Move the desktop nav item vertical padding/height into the shared base class rather than applying different padding per state.
- Use the current active element dimensions as the source of truth: the inactive, hovered, focused, and active links must occupy the same box.
- State changes should affect only background and foreground colors, never layout.
- Preserve the current 18/18 JetBrains Mono typography, horizontal padding, radius, routes, and active-route logic.
- Verify the mobile drawer links already retain identical dimensions across states; only change them if inspection reveals state-dependent geometry.

### 3. Use provider-neutral source-video copy

Update `VideoDetail.tsx`:

- Replace the platform-dependent sentence with the exact provider-neutral label:
  - `Can't see the video? Watch source video`
- Keep the external-link icon, direct URL, new-tab behavior, and accessibility attributes.
- Do not expose whether the source is YouTube or Vimeo in this fallback label.

### 4. Share the video archive across routes

Refactor the archive state into an app-level provider while preserving the existing consumer API:

1. Add a `VideoArchiveProvider` and context alongside the existing archive hook, or in a focused context module if that keeps the file clearer.
2. Move the fetch lifecycle—videos, loading, error, abort handling, normalization—into the provider.
3. Wrap `RouterProvider` with `VideoArchiveProvider` in `App.tsx`, inside or alongside `LanguageProvider`.
4. Keep `useVideoArchive()` as the consumer hook returning `{ videos, loading, error }`, so `Home`, `RandomInspiration`, and `VideoDetail` need minimal changes.
5. Throw a clear development error if the hook is used outside the provider.

Behavior:

- The archive is requested once per app session, not once per route mount.
- Navigating from Browse to Shuffle uses the already-loaded array immediately.
- Navigating from Browse to a video detail also reuses the same data.
- A direct page load on `/random` or `/video/:id` still performs the one required initial archive request.
- Existing loading and error states remain available to every route.
- Do not add a third-party query/cache package for this small shared state.

### 5. Hydrate missing Vimeo thumbnails without blocking the archive

Extend archive loading/normalization:

- Keep explicit Supabase `thumbnail` / `thumbnail_url` values as the highest-priority thumbnail source.
- Keep the current YouTube `i.ytimg.com` fallback.
- For a Vimeo video with no stored thumbnail:
  - Request `https://vimeo.com/api/oembed.json?url=<encoded direct Vimeo URL>`.
  - Read `thumbnail_url` from the response.
  - Update only that video’s thumbnail in shared archive state.
- Set the normalized archive and clear the main loading state before awaiting Vimeo thumbnail hydration. Thumbnail lookup must not delay Browse, Video Detail, or Shuffle.
- Resolve each missing Vimeo thumbnail at most once per provider lifetime.
- Treat oEmbed failure as non-fatal:
  - Do not replace the archive error state.
  - Do not remove the video.
  - Do not block Shuffle.
  - Leave a deliberate black media placeholder rather than rendering a broken `<img>`.
- Respect provider unmount/abort state before applying asynchronous thumbnail updates.

For “Death From Above — Virgins,” the expected result is a valid image served from `i.vimeocdn.com`.

### 6. Redesign Contribute as an editorial form

Recompose `Submit.tsx` without changing its current client-side submission behavior:

- Use a wider editorial page container aligned with the site’s main content width rather than a narrow generic form card.
- On desktop, use a two-column composition:
  - Left: page heading and existing explanatory copy.
  - Right: the form.
- Stack naturally on mobile with a clear heading-to-form rhythm.
- Remove full rectangular white strokes from text fields and select.
- Replace boxed inputs with a restrained editorial field treatment:
  - Black background.
  - Helvetica text.
  - A single bottom rule rather than a four-sided box.
  - White default rule and accent focus rule.
  - No gray/translucent placeholder or disabled colors.
- Group related optional production fields into responsive two-column rows where space allows, while preserving logical keyboard/tab order.
- Keep labels visible; retain accent required markers.
- Restyle the submit action to match site navigation:
  - Compact content-width button, not full width.
  - Solid `#D9E800` background with black text.
  - JetBrains Mono ExtraBold, uppercase.
  - Same radius and crisp state changes as active navigation.
  - Left-aligned with the form content.
- Preserve required fields, select options, state updates, and current temporary success behavior.
- Redesign the success state in the same editorial style and replace `TOCHKA` with `dazed and amazed`.

### 7. Redesign About as an editorial profile

Recompose `About.tsx` while retaining the existing factual prose:

- Align the page to the same wide site container used by Browse and Contribute.
- Remove the centered generic “About” card-page presentation.
- Create an asymmetrical desktop profile:
  - Strong left/top heading and editorial introduction.
  - Borderless portrait using the existing Polina image.
  - Readable text column with controlled line length.
- Remove the portrait border, quote divider, rounded mission border, and boxed mission surface.
- Use hierarchy rather than boxes:
  - JetBrains Mono for the main page heading and section labels.
  - Kommuna Demo Narrow for one expressive element, preferably the pull quote or curator line.
  - Helvetica stack for factual body copy.
  - Accent used selectively for the pull quote, section marker, or small rule—not as a large decorative fill.
- Integrate the quote as a large pull quote, not a small bordered footnote.
- Integrate “Our Mission” as an open editorial section, not a card.
- Maintain a balanced crop of the existing 853×1280 portrait without distortion.
- On mobile, stack heading, portrait, bio, quote, and mission in a deliberate reading order with no horizontal overflow.

### 8. Preserve the strict palette and current media behavior

Across all touched components:

- UI chrome remains solid black, white, or `#D9E800`.
- Editorial photos and fetched thumbnails retain their source colors.
- Do not reintroduce white alpha fills, gray borders, or red/green statuses.
- Preserve existing share controls, tag filtering, routes, responsive behavior, and iframe playback.
- Do not modify Supabase table data merely to fix the Vimeo thumbnail; the runtime fallback should support future Vimeo rows with missing thumbnails.

## Edge cases and failure modes

- The archive endpoint may return an empty list: Shuffle should continue redirecting safely to Browse.
- A direct `/random` load cannot be instant because it still needs the initial archive request; the optimization targets redundant route-to-route requests.
- A Vimeo URL may already be an embed URL or contain extra path/query data; reuse the existing Vimeo ID/direct-URL normalization and send the original direct URL to oEmbed.
- Vimeo oEmbed may reject private or deleted videos; show the deliberate fallback media state without surfacing an archive-wide error.
- A video may have an invalid stored thumbnail; retain current media behavior unless implementation can add a small local image-error fallback without expanding scope.
- Provider teardown during archive or oEmbed requests must not update state afterward.
- Re-entering `/random` should choose again from the in-memory archive without triggering a refetch.
- Form changes are visual/layout changes only; do not imply that submissions are persisted when they are not.

## Verification

### Visual and interaction checks

- Card and detail tags have no white outline in default state.
- Tag hover remains accent/black and causes no size or layout shift.
- Video descriptions have no border, rounded box, or boxed background.
- Every desktop nav item has identical dimensions in inactive, hover, focus, and active states.
- The source fallback reads exactly `Can't see the video? Watch source video`.
- Contribute has no four-sided field boxes; focus state remains obvious and keyboard accessible.
- Contribute CTA is compact, accent-filled, mono, uppercase, and aligned with the site language.
- About reads as an editorial profile on desktop and a coherent stacked story on mobile.

### Data and performance checks

- Confirm only one `/api/videos` request occurs while navigating Browse → Shuffle → Video Detail → Browse.
- Confirm Browse → Shuffle redirects immediately after the archive has loaded.
- Confirm a direct `/random` load waits for one archive request and then redirects correctly.
- Confirm “Death From Above — Virgins” receives an `i.vimeocdn.com` thumbnail.
- Simulate Vimeo oEmbed failure and confirm the archive, Shuffle, and other cards continue functioning.
- Confirm Vimeo thumbnail hydration does not keep the archive-wide loading state active.

### Regression checks

- Search and tag filtering still work.
- Clicking tags from Video Detail still returns to Browse with the filter parameter.
- YouTube thumbnails and `youtube-nocookie.com` embeds are unchanged.
- Vimeo embeds remain on `player.vimeo.com`.
- Language-specific descriptions still switch correctly.
- Submit validation and temporary success state still work.
- Mobile navigation drawer still opens, closes, and changes routes.

### Repository checks

- Run `pnpm build`.
- Run `git diff --check`.
- Search touched files for unintended `white/*`, gray, red, green, or unsupported hex UI colors.

## Expected files

- `src/app/App.tsx`
- `src/app/hooks/useVideoArchive.ts` or a new focused archive context/provider module
- `src/app/components/Root.tsx`
- `src/app/components/VideoCard.tsx`
- `src/app/components/VideoDetail.tsx`
- `src/app/components/RandomInspiration.tsx` only if a small adaptation is required for shared state
- `src/app/components/Submit.tsx`
- `src/app/components/About.tsx`
