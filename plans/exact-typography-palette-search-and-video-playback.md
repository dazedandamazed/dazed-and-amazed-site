# Exact typography, palette, search geometry, and video playback

## Goal

Bring the current React/Vite site into exact typographic and geometric alignment with the supplied Figma reference while fixing YouTube error 153. Preserve the current information architecture, responsive behavior, Supabase archive flow, `youtube-nocookie.com` requirement, and the recently redesigned header/footer/card structure.

## Confirmed design and product decisions

- Use only these solid UI colors:
  - Black: `#000000`
  - White: `#FFFFFF`
  - Accent: `#D9E800`
- Do not use translucent white/black UI states, gray shades, red/green status colors, or other hues. Full-color video thumbnails, videos, and editorial photographs are media and are not recolored.
- Use the uploaded **Kommuna Demo / 400 Narrow** face for both:
  - Band/artist names
  - `En` / `Ru` language toggle
- Keep the existing body/search stack: `"Helvetica Neue", Helvetica, Arial, sans-serif`.
- Use **JetBrains Mono ExtraBold (800)** for headings, video titles, and navigation.
- Keep all YouTube embeds on `https://www.youtube-nocookie.com`.
- Preserve the card share button and video-detail share controls.

## Current-state findings

- `src/styles/index.css` imports `src/styles/fonts.css`, so `fonts.css` is the correct reachable font entry point.
- Figma Make settings now expose `Kommuna Demo / 400 Narrow`; `figma fonts resolve` successfully returns a WOFF2 payload.
- Figma does not expose `Helvetica Neue / Regular`; the user chose to retain the current local Helvetica stack.
- JetBrains Mono is already loaded from Google Fonts, but the project also has a redundant Figma CDN `@font-face` alias. Consolidate this to one family/source.
- Space Grotesk is currently used as a Kommuna substitute and should be removed.
- The design reference specifies:
  - Navigation: JetBrains Mono ExtraBold, 18/18, `-0.36px`
  - Video title: JetBrains Mono ExtraBold, 24/28, `-0.36px`
  - Artist: Kommuna Narrow, 28/33
  - Language toggle: Kommuna Demo Narrow, 20px, 36px control height
  - Tags: Helvetica Neue Regular, 14/20
  - Search wrapper: 672×50px
  - Search field: 672×26px, 1px accent border, 7px radius
  - Search horizontal inset: 31px
  - Search icon: 12.75px
  - Search text: Helvetica Neue Regular, 16px
- YouTube URLs are normalized in `src/app/hooks/useVideoArchive.ts`, while autoplay is appended separately in `VideoCard.tsx`.
- Neither iframe currently sets `referrerPolicy`; error 153 means YouTube is not receiving a usable HTTP referrer or equivalent client identification.

## Implementation plan

### 1. Install and wire the exact available fonts

1. Re-run `figma fonts resolve` for only:
   - `Kommuna Demo` / `400 Narrow`
2. Resolve into `public/fonts/` and use the exact CLI-returned filename/path; do not retain expiring Figma URLs in runtime code.
3. In `src/styles/fonts.css`:
   - Keep one Google Fonts CSS2 import for `JetBrains Mono` with weight 800 (include other weights only if a current callsite genuinely uses them).
   - Remove the Space Grotesk import.
   - Remove the duplicate `JetBrains Mono:ExtraBold` Figma-CDN alias.
   - Add one local `@font-face` for the resolved Kommuna Demo file with `font-style: normal`, `font-weight: 400`, `font-display: swap`, and the CLI-reported format.
4. Normalize callsites:
   - Use `"JetBrains Mono"` at weight 800 rather than the synthetic family name `"JetBrains Mono:ExtraBold"`.
   - Use `"Kommuna Demo"` for artist names and the language toggle.
   - Retain `"Helvetica Neue", Helvetica, Arial, sans-serif` for body copy, inputs, labels, tags, and footer copy.
5. Do not synthesize or alias unavailable font family names.

### 2. Match exact typography and proportions

Update the relevant classes/styles in `Root.tsx`, `LanguageToggle.tsx`, `VideoCard.tsx`, `Home.tsx`, and typography defaults in `theme.css`:

- Desktop navigation: 18px font, 18px line-height, weight 800, uppercase, `-0.36px` letter spacing.
- Video titles: 24px font, 28px line-height, weight 800, uppercase, `-0.36px` letter spacing.
- Artist names: Kommuna Demo Narrow, 28px font, 33px line-height, weight 400.
- Language toggle: Kommuna Demo Narrow, 20px font, 36px control height; preserve `En` and `Ru` casing.
- Tags: Helvetica stack, 14px font, 20px line-height.
- Footer copy: Helvetica stack, 14px font, 20px line-height.
- Keep responsive wrapping and fluid card widths; exact values apply to typography and controls, not fixed desktop-only page widths.

### 3. Rebuild the search control to the reference geometry

In `Home.tsx`:

- Keep a fluid width with `max-width: 672px`.
- Give the search region a 50px height.
- Set the actual field to 26px high, full width, with:
  - 1px `#D9E800` border
  - 7px radius
  - Black fill
  - 31px outer horizontal inset
  - 16px Helvetica-stack text
  - White placeholder/text under the solid-color requirement
- Set the search icon to 12.75px and align it at the reference inset.
- Account for the icon plus the 10px reference gap when setting input text padding.
- Align the conditional clear control to the same geometry without changing the field height.
- Preserve search behavior, query filtering, and keyboard input behavior.

### 4. Enforce the three-color UI palette

In `src/styles/theme.css`:

- Introduce or normalize semantic tokens so all visible UI tokens resolve to black, white, or `#D9E800`.
- Set background/surface/popover/input/sidebar tokens to black.
- Set text/foreground/border/focus tokens to white or accent according to function.
- Replace destructive/success/chart fallback tokens with one of the approved colors so no unsupported hue can render.
- Remove the alternate `.dark` palette values that introduce gray/colored OKLCH output, or map them to the same three-color palette.
- Set form color scheme deliberately so browser-native controls do not introduce unintended colors.

Across app components (excluding full-color media):

- Replace `white/*`, `black/*`, gray literals such as `#0a0a0a`, and opacity-based UI styling with solid approved colors.
- Use black/white inversion or accent/black for hover, active, selected, focus, success, and error states.
- Replace red required/error indicators and green submission-success marks with accent or white.
- Remove footer/social opacity transitions; use solid white and accent/white hover treatment.
- Prefer omission of a low-priority divider over introducing gray.
- Keep video/image hover effects only if they affect media rather than introducing UI chrome colors.

### 5. Fix YouTube error 153 at the source

1. In `index.html`, add:
   - `<meta name="referrer" content="strict-origin-when-cross-origin">`
2. In `useVideoArchive.ts`:
   - Continue extracting YouTube IDs from watch, short, and embed URLs.
   - Continue emitting `youtube-nocookie.com/embed/<id>`.
   - Build embed URLs with the `URL`/`URLSearchParams` API.
   - Add the current application origin as the YouTube `origin` parameter when running in the browser.
   - Preserve Vimeo behavior and unknown provider URLs.
3. In `VideoCard.tsx`:
   - Replace string concatenation for autoplay with URL-safe query mutation so existing parameters are preserved.
4. On both iframe callsites (`VideoCard.tsx` and `VideoDetail.tsx`):
   - Set `referrerPolicy="strict-origin-when-cross-origin"`.
   - Keep `allowFullScreen`.
   - Keep the existing media permissions and card autoplay permission.
5. Do not switch back to standard `youtube.com` embeds.
6. Preserve the existing direct-video fallback link on the detail page.

## Edge cases

- A Supabase row may contain a YouTube watch URL, `youtu.be` URL, an existing nocookie embed URL, a Vimeo URL, or an already-embeddable provider URL; normalization must remain idempotent.
- Query parameters such as playlist/start data should not produce malformed URLs; append playback parameters through `URLSearchParams`.
- `window.location.origin` must only be read in browser-executed code so builds remain safe.
- If the custom font resolver returns a different local filename, use the returned path rather than hardcoding the temporary filename observed during planning.
- If the Kommuna payload fails to resolve during implementation, stop and report the resolver result rather than restoring Space Grotesk.
- Solid-color enforcement applies to interface chrome, text, borders, and controls, not editorial media.

## Verification

1. Font verification:
   - Confirm the resolved Kommuna file exists under `public/fonts/` and is non-empty.
   - Confirm built CSS references the local Kommuna asset.
   - Confirm there are no Space Grotesk imports/callsites and no expiring Figma font URLs.
   - Confirm computed artist and language-toggle families use Kommuna Demo; headings/navigation use JetBrains Mono 800; body/search use the retained Helvetica stack.
2. Geometry verification at the Figma desktop reference width:
   - Search wrapper is 672×50px.
   - Field is 672×26px with 1px `#D9E800` border and 7px radius.
   - Icon, insets, typography, navigation, title, artist, tag, and language-toggle measurements match the values above.
   - Confirm the search stays fluid without horizontal overflow on mobile.
3. Palette verification:
   - Search application source for disallowed UI hex values, named color utilities, and opacity color utilities.
   - Inspect header, mobile sheet, home/filter states, cards/share menu, random pages, submit success/error states, detail page, about page, and footer.
   - Confirm rendered UI chrome contains only solid black, solid white, and `#D9E800`.
4. Playback verification:
   - In the existing Make preview, play at least one YouTube video from a card and from its detail page.
   - Confirm requests use `youtube-nocookie.com`, include the application origin parameter, and are sent under `strict-origin-when-cross-origin`.
   - Confirm error 153 is absent, autoplay works after the card click, fullscreen remains available, and Vimeo behavior is unchanged.
5. Run the repository build script with the available package manager: `pnpm build`.
6. Run `git diff --check`.

## Files expected to change

- `public/fonts/<resolved-kommuna-file>.woff2` (exact name from resolver)
- `src/styles/fonts.css`
- `src/styles/theme.css`
- `index.html`
- `src/app/hooks/useVideoArchive.ts`
- `src/app/components/Home.tsx`
- `src/app/components/Root.tsx`
- `src/app/components/LanguageToggle.tsx`
- `src/app/components/VideoCard.tsx`
- `src/app/components/VideoDetail.tsx`
- Other visible app components only where required to remove disallowed UI colors (`About.tsx`, `Submit.tsx`, `RandomThought.tsx`, `RandomInspiration.tsx`)
