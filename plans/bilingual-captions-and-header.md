# Plan: Bilingual video captions and responsive header navigation

## Objective

Update the site so Browse cards no longer display editorial captions, every video-detail caption uses the site-wide `#212121` surface, and visitors can switch video descriptions between English and Russian from a persistent `en / ru` control in the header. The interface itself remains English.

## Confirmed product decisions

- Localization scope is **video descriptions only**. Navigation, search, tags, forms, empty states, footer copy, and other UI remain English.
- First-time visitors see **English** descriptions.
- The selected language is remembered across routes and reloads.
- The caption panel uses `#212121` on **all** `/video/:id` detail pages, whether reached from Browse, Random Inspo, browser history, or a direct URL.
- On mobile, the language toggle remains visible at the far-right of the header. A hamburger immediately to its left opens the five navigation destinations.
- On desktop, retain the current full navigation and add the language toggle at the far right.
- The user’s forthcoming translation-instructions file is authoritative for the English translation style.

## Required input before implementation

1. Locate and read the translation-instructions file the user adds to the repository or session.
2. Follow its voice, terminology, punctuation, preservation, and formatting rules when translating all current Russian descriptions.
3. If the file is absent at implementation time, stop before authoring translations and request it; the non-translation UI work can be prepared, but the feature is not complete without the approved translation rules and all English captions.

## Implementation

### 1. Make caption data explicitly bilingual

**File:** `src/app/data/videos.ts`

- Export a shared language type such as `type Language = "en" | "ru"` from the localization module described below, or define it in a dependency-neutral localization types file to avoid runtime coupling from data to React.
- Replace the ambiguous optional `description?: string` field with an explicitly bilingual shape:
  - `descriptions?: { en: string; ru: string }`
  - Keeping the entire object optional allows future videos with no editorial caption.
  - Requiring both keys whenever a caption exists prevents accidental Russian fallback while English is selected and makes incomplete imports a type error.
- Move each of the 30 existing descriptions into `descriptions.ru` **without rewriting or normalizing the source text**.
- Add `descriptions.en` for each record, translated according to the user-provided instruction file.
- Preserve paragraph breaks, quoted passages, links, names, profanity level, and other source formatting unless the translation instructions explicitly say otherwise.
- Do not translate titles, artist names, tags, credits, or other site data as part of this change.

### 2. Add a small global caption-language state boundary

**New file:** `src/app/contexts/LanguageContext.tsx` (or the project’s equivalent small localization module)

- Define `Language` as the closed union `"en" | "ru"`.
- Provide a `LanguageProvider` and `useLanguage()` hook exposing the selected language and a setter.
- Initialize synchronously from a namespaced local-storage key such as `dazed-and-amazed:caption-language` to avoid a post-render language flash.
- Accept only the two known stored values; use `en` for first visits, invalid values, unavailable storage, or storage read errors.
- Persist changes to local storage, handling blocked/unavailable storage without breaking the UI.
- Keep this deliberately narrower than a full i18n framework because only one content field is localized and there is no locale-aware routing or translated interface copy.

**File:** `src/app/App.tsx`

- Wrap `RouterProvider` in `LanguageProvider` so the header and routed detail content share one state across navigation.

### 3. Add the accessible `en / ru` header control

**New file:** `src/app/components/LanguageToggle.tsx`

- Build the control from the existing local `ToggleGroup` and `ToggleGroupItem` primitives as a single-selection group.
- Render compact lowercase labels `en` and `ru`, matching the requested presentation.
- Give the group an accessible label such as “Caption language,” expose the selected item through the primitive’s pressed/selected semantics, and prevent the single-select group from being cleared to no value.
- Use the established editorial styling: compact type, subtle border/unselected treatment, and `#D9E800` with black text for the selected language, consistent with selected header navigation.
- Keep touch targets usable on mobile and avoid introducing a new component library or icon.

### 4. Make the header responsive with a mobile hamburger

**File:** `src/app/components/Root.tsx`

- Represent the five existing navigation destinations (Browse, Random Inspo, Random Thought, Submit, About) as one local navigation configuration so desktop and mobile renderings cannot drift in labels, icons, links, or active-state rules.
- Desktop (`sm` and above):
  - Preserve the current logo and full navigation.
  - Place `LanguageToggle` after navigation at the far right.
- Mobile (below `sm`):
  - Keep the logo on the left.
  - Put a hamburger menu trigger to the right of the logo and immediately left of `LanguageToggle`; the language control remains the far-right element.
  - Use the existing local `Button` primitive for the icon trigger and a Lucide `Menu` icon with a clear accessible name.
  - Use the existing Radix-backed `Sheet` primitives for a right-side navigation panel rather than creating custom overlay/focus behavior.
  - Include an accessible sheet title and description (visually hidden if appropriate), render all five destinations as large vertical links, retain the active yellow state, and close the sheet when a destination is selected.
- Preserve sticky positioning, `#212121` header color, safe-area top padding, logo sizing behavior, and keyboard/focus accessibility.
- Do not place a second language selector inside the sheet.

### 5. Remove captions from Browse cards

**File:** `src/app/components/VideoCard.tsx`

- Remove the description/caption rendering block entirely from Browse cards.
- Keep thumbnails, title, artist, sharing, all three tag rows, filtering behavior, and spacing intact.
- Do not merely hide the caption with CSS; avoid rendering it in Browse mode.

### 6. Render the selected caption on detail pages

**File:** `src/app/components/VideoDetail.tsx`

- Read the selected language through `useLanguage()`.
- Select only `video.descriptions?.[language]`; never fall back to Russian when English is selected or vice versa.
- Render the caption panel only when the selected value is non-empty.
- Add `lang={language}` to the caption text/container so assistive technology applies the correct language rules even though the surrounding UI remains English.
- Change the panel background from `#0a0a0a` to `#212121`, retaining the subtle border, padding, readable text color, paragraph line breaks, and existing layout.
- This shared detail implementation intentionally covers both Random Inspo redirects and ordinary/direct detail navigation; no navigation-origin state is needed.

## Edge cases and non-goals

- Empty video archive behavior in Random Inspo remains unchanged.
- Language selection is not added to the URL; shared video URLs stay stable and recipients use their own saved/default preference.
- Switching language must update the currently open caption immediately without reloading the video iframe or changing routes.
- Missing or malformed local-storage data must never prevent rendering.
- Captioned records must contain both translations. A genuinely captionless future record may omit `descriptions` and shows no panel in either language.
- Browse search currently does not search descriptions; this remains unchanged.
- Random Thought content is out of scope and is not translated by this toggle.
- The existing desktop navigation labels and all interface copy remain English.

## Verification

### Data checks

- Confirm all 30 current videos still exist and retain their IDs and non-caption metadata.
- Confirm every record that previously had `description` now has non-empty `descriptions.ru` and `descriptions.en` values.
- Confirm each Russian source string is preserved exactly after moving it into the bilingual object.
- Confirm no legacy `video.description` reads remain.

### Functional checks in the existing supervised dev server

- Browse page at desktop and mobile widths: no editorial captions appear on cards; card metadata and infinite scroll remain intact.
- Direct video detail: defaults to English on a clean first visit; selecting `ru` immediately shows the Russian source and selecting `en` restores English.
- Reload and navigate among Browse, Random Inspo, and multiple detail pages: the selected language persists.
- Caption panels use `#212121` on both direct/Browse detail navigation and Random Inspo-selected videos.
- Mobile header: logo, hamburger, and visible far-right language toggle fit without horizontal overflow; menu opens with all five links, keyboard focus is trapped/restored by the Sheet primitive, active navigation styling is correct, and choosing a link closes the menu.
- Desktop header: all five existing links remain visible and the language control is at the far right.
- Verify the header still respects iOS safe-area padding and sticky behavior.

### Repository checks

- Run the repository formatter on every changed TypeScript/TSX file using `pnpm format <changed files>`.
- Run `pnpm build` because the work changes shared types, context wiring, routing-shell UI, and all video records.
- Treat any nonzero result as a failure to fix. Report the existing Vite chunk-size warning separately if it remains non-blocking.

## Expected file set

- Modify `src/app/App.tsx`
- Modify `src/app/components/Root.tsx`
- Modify `src/app/components/VideoCard.tsx`
- Modify `src/app/components/VideoDetail.tsx`
- Modify `src/app/data/videos.ts`
- Add `src/app/components/LanguageToggle.tsx`
- Add `src/app/contexts/LanguageContext.tsx` (and, only if needed to avoid data-to-React coupling, a tiny dependency-neutral language type module)
- Do not modify generated/local UI primitive implementations under `src/app/components/ui/`
