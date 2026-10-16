# Restore `#212121` Content Surfaces and `#D9E800` Selected Navigation

## Goal

Finish the visual update by removing the remaining near-black fills from the user-identified content areas and restoring the lime accent on clicked/selected header navigation.

## Confirmed Scope

- Change these remaining dark content surfaces to `#212121`:
  - The Home page search input.
  - The About page “Our Mission” panel.
  - All eight controls in the Submit form: seven text/URL inputs and the decade select.
- Restore `#D9E800` as the selected state for all five header navigation links:
  - Browse.
  - Random Inspo.
  - Random Thought.
  - Submit.
  - About.
- Keep selected-navigation text and icons black for contrast against `#D9E800`.

## Implementation

### 1. Home search surface

In `src/app/components/Home.tsx`:

- Change the search input background class from `bg-[#111111]` to `bg-[#212121]`.
- Preserve its border, typography, placeholder, focus border, spacing, and transition classes.
- Do not change the search icon, clear button, filter chips, or empty-state actions.

### 2. About mission panel

In `src/app/components/About.tsx`:

- Change the “Our Mission” panel background from `bg-[#0a0a0a]` to `bg-[#212121]`.
- Preserve its border, radius, padding, spacing, heading, and body text styles.
- Do not change the biography, image, or quote section.

### 3. Submit form controls

In `src/app/components/Submit.tsx`:

- Change each of the seven `input` backgrounds from `bg-[#111111]` to `bg-[#212121]`:
  - Artist Name.
  - Video Title.
  - YouTube or Vimeo URL.
  - Director.
  - Production Company.
  - Director of Photography.
  - Techniques/Concepts.
- Change the Decade `select` background from `bg-[#111111]` to `bg-[#212121]`.
- Preserve all control borders, text, placeholders, focus behavior, spacing, validation attributes, and form state handling.
- Keep the primary “Submit Video” button white with black text; it is not one of the remaining black surfaces identified by the user.
- Do not alter the submission success state.

### 4. Selected header navigation

In `src/app/components/Root.tsx`:

- For each of the five pathname-based active branches, replace `bg-white text-black` with `bg-[#D9E800] text-black`.
- Preserve inactive styling (`text-white/70`, white hover text, subtle white hover background), sizing, rounding, transitions, icons, labels, links, and route matching.
- Apply the same selected treatment consistently to every route rather than only the three labels mentioned, as confirmed by the user.
- Do not change the shared `#212121` page/header backgrounds.

## Explicit Non-Goals

- Do not change reusable theme tokens or introduce a global token refactor; the project already uses `#D9E800` directly for established accent interactions, and the requested change is narrowly scoped.
- Do not change intentional black or near-black video-player fallbacks, cards, menus, overlays, or unrelated component-library controls.
- Do not change existing `#D9E800` hover styles on video titles and metadata tags.
- Do not change archive data or restore missing videos.
- Do not alter content, routing, component structure, or form behavior.

## Edge Cases

- The selected header item must retain black text and icon color for readable contrast on the bright lime background.
- The active state is derived from `location.pathname`; route changes should move the accent to the newly selected link without retaining it on the previous route.
- With an empty archive, `/random` currently redirects to `/`; after the redirect, Browse—not Random Inspo—will correctly display as selected.
- Since the updated content surfaces match the surrounding `#212121` canvas, their existing subtle borders must remain to preserve field and panel boundaries.

## Verification

1. Review the scoped diff and confirm changes are limited to `Home.tsx`, `About.tsx`, `Submit.tsx`, and `Root.tsx`.
2. Search the four files to confirm:
   - No `bg-[#111111]` remains in the Home search input or Submit form controls.
   - No `bg-[#0a0a0a]` remains on the “Our Mission” panel.
   - All five active navigation branches use `bg-[#D9E800] text-black`.
3. In the existing hot-reloading preview, inspect:
   - `/`: search input matches the `#212121` page canvas; Browse is lime-selected.
   - `/thought`: Random Thought is lime-selected.
   - `/submit`: all form controls use `#212121`, remain visibly bounded by their borders, and Submit is lime-selected; the white Submit Video action is unchanged.
   - `/about`: the mission panel uses `#212121`, and About is lime-selected.
   - `/random`: verify its empty-archive redirect returns to `/` and leaves Browse selected.
4. Confirm inactive navigation hover styling and existing lime hover states on video metadata still work.
5. No build or typecheck is required for these localized class-only styling edits unless the preview exposes a concrete failure.
