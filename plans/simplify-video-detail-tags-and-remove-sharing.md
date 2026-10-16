# Simplify video-detail tags and remove sharing

## Goal

Make the single-video page’s metadata match the clean three-row tag presentation used in Browse, shorten the source fallback copy, and remove the sharing feature everywhere rather than retaining the current bordered Twitter/Facebook menus.

## Confirmed product decisions

- The single-video page should keep three distinct tag rows:
  1. Techniques
  2. Creators
  3. Decade
- The rows should have no visible headings such as `Techniques / Concepts`, `Production Credits`, or `Era`.
- Creator tags should display only the stored values, exactly as Browse does:
  - No `Dir:`
  - No `Prod:`
  - No `DOP:`
- Tag click behavior and filtering remain unchanged.
- The source fallback label should be exactly:
  - `Can't see the video? Try source`
- Remove sharing everywhere:
  - Single-video page
  - Browse video cards
- Do not replace sharing with copy link, native share, or another menu.

## Current-state findings

- `VideoDetail.tsx` renders three tag groups but adds a heading above each row and prefixes creator values.
- Its tag geometry also differs slightly from Browse (`rounded-sm`, `py-1.5`, no explicit Helvetica class).
- `VideoCard.tsx` is the visual source of truth for the requested tag presentation:
  - Three separate unlabelled rows
  - `flex flex-wrap gap-2`
  - Borderless black tags
  - Helvetica 14/20
  - Accent background and black text on hover
- Both `VideoDetail.tsx` and `VideoCard.tsx` contain independent share state, Twitter/Facebook handlers, clipboard handlers, dropdown markup, and share icons.
- The current dropdown containers are the “weird stroke” surfaces the user wants removed.

## Implementation plan

### 1. Match detail-page tags exactly to Browse

Update the tag section in `VideoDetail.tsx`:

- Remove the three visible metadata headings:
  - `Techniques / Concepts`
  - `Production Credits`
  - `Era`
- Keep three separate row containers in the same order.
- Match the Browse row structure and spacing:
  - Outer row spacing equivalent to `space-y-1`
  - Inner `flex flex-wrap gap-2`
- Match the Browse tag classes exactly:
  - `rounded-md`
  - Black default background
  - Horizontal padding `px-3`
  - Vertical padding `py-1`
  - Helvetica Neue stack
  - `text-sm`
  - `leading-5`
  - Solid accent background and black text on hover
- Remove creator-role prefixes and render:
  - `video.creators.director`
  - `video.creators.productionCompany`
  - `video.creators.dop`
- Preserve conditional rendering when individual creator values are missing.
- Preserve each button’s existing `handleTagClick` behavior, which navigates to Browse with the corresponding filter.
- Keep the decade in its own third row.
- Do not merge the three rows even when one contains only a single tag.

### 2. Shorten the source fallback copy

In `VideoDetail.tsx`:

- Replace the existing source text with exactly:
  - `Can't see the video? Try source`
- Preserve:
  - `video.videoDirectUrl`
  - New-tab behavior
  - `rel="noopener noreferrer"`
  - External-link icon
  - Existing white-to-accent hover treatment

### 3. Remove sharing from the single-video page

In `VideoDetail.tsx`:

- Remove the share button beside the title.
- Remove the bordered share dropdown and all Twitter, Facebook, and Copy Link controls.
- Remove:
  - `showShareMenu` state
  - `videoPageUrl`
  - `shareToTwitter`
  - `shareToFacebook`
  - `copyLink`
- Remove unused React and Lucide imports:
  - `useState`
  - `Share2`
  - `Twitter`
  - `Facebook`
  - aliased `LinkIcon`
- Simplify the title/artist layout after the right-side action disappears:
  - Remove unnecessary `justify-between` share layout.
  - Keep the current title and artist typography and spacing.
- Do not add replacement chrome or an empty spacer.

### 4. Remove sharing from Browse cards

In `VideoCard.tsx`:

- Remove the share icon button and dropdown from every card.
- Remove:
  - `showShareMenu` state
  - `videoPageUrl`
  - Twitter and Facebook handlers
  - Clipboard handler
- Remove the `Share2` import.
- Retain `useState` because card playback still uses `playing`.
- Simplify the title/artist wrapper after the right-side share control is removed.
- Preserve:
  - Card title link
  - Artist typography
  - Video playback
  - Thumbnail behavior
  - All three tag rows and filtering

### 5. Keep scope narrow

- Do not remove or change the direct source link; only change its label.
- Do not change the “Sources & Further Reading” section.
- Do not change the video media/stills section.
- Do not alter archive data, routing, Vimeo hydration, iframe behavior, or language switching.
- Do not introduce a new shared Tag component solely for this small parity change unless duplication materially obstructs exact class matching.
- Preserve the strict black, white, and `#D9E800` interface palette.

## Edge cases

- A creator row may contain one, two, three, or zero values:
  - Render available values in row two.
  - If all creator values are absent, retain row separation only if needed for layout; avoid rendering an empty visual gap if possible.
- A video may have no techniques:
  - Do not render empty buttons.
  - Avoid a large empty heading/gap because headings are being removed.
- A video may have an empty decade:
  - Do not render an empty clickable tag.
- Removing sharing must not affect card playback state; `useState` remains in `VideoCard`.
- Removing the detail share state should leave no unused imports or browser-global access.

## Verification

### Detail-page checks

- The strings `Techniques / Concepts`, `Production Credits`, and `Era` no longer render on the single-video page.
- Creator tags contain no `Dir:`, `Prod:`, or `DOP:` prefixes.
- Tags remain in three separate rows and visually match Browse tags exactly.
- Clicking each tag still navigates to Browse and applies the expected filter.
- The source link reads exactly `Can't see the video? Try source`.
- The source link still opens the original YouTube or Vimeo URL in a new tab.

### Sharing-removal checks

- No share icon appears on video cards or the detail page.
- No Twitter, Facebook, or Copy Link dropdown appears anywhere.
- Search the app source for and remove obsolete sharing implementation:
  - `Share2`
  - `shareToTwitter`
  - `shareToFacebook`
  - `copyLink`
  - `showShareMenu`
  - Twitter/Facebook intent URLs
- Confirm no unrelated social links in the footer are removed; Instagram, Telegram, and YouTube footer links remain.

### Regression checks

- Card thumbnails and click-to-play behavior still work.
- Detail iframe playback still works.
- Title and artist alignment remains clean after removing right-side controls.
- Search, Browse filtering, Shuffle, Vimeo thumbnail hydration, language switching, and source links are unchanged.
- Verify mobile wrapping for long creator names and multiple technique tags.

### Repository checks

- Run `pnpm build`.
- Run `git diff --check`.
- Check touched files for unused imports and stale share code.

## Expected files

- `src/app/components/VideoDetail.tsx`
- `src/app/components/VideoCard.tsx`
