# Plan: Bilingual video captions and responsive header navigation

## Objective

Update the site so Browse cards never display editorial captions, every video-detail caption uses the site-wide `#212121` surface, and visitors can switch video descriptions between English and Russian from a persistent `en / ru` control in the header. The interface itself remains English.

## Confirmed product decisions

- Localization scope is **video descriptions only**. Navigation, search, tags, forms, empty states, footer copy, and other UI remain English.
- First-time visitors see **English** descriptions.
- The selected language is remembered across routes and reloads.
- The caption panel uses `#212121` on **all** `/video/:id` detail pages, whether reached from Browse, Random Inspo, history, or a direct URL.
- On mobile, the language toggle remains visible at the far-right of the header. A hamburger immediately to its left opens the five navigation destinations.
- On desktop, retain the current full navigation and add the language toggle at the far right.
- Translation ambiguities and cultural-reference choices are reviewed by the user **before** English captions are integrated.
- The supplied translation rules become a durable repository guideline.

## Authoritative translation input

The source attachment is `72daba1e-aded-4a87-98ad-40b679d7b2a4` (`ru-en-adaptation-rules.md`). During implementation:

1. Fetch the attachment with `figma attachments get 72daba1e-aded-4a87-98ad-40b679d7b2a4`; use the exact resolved path returned by the CLI.
2. Copy its contents verbatim into the new tracked file `guidelines/TranslationGuidelines.md` so future imports use the same standard.
3. Treat those rules as authoritative. In particular:
   - Adapt rather than translate sentence by sentence.
   - Preserve Polina’s meaning, certainty level, emotional temperature, thinking-aloud structure, rhythm, repetition, fragments, slang, and profanity intensity.
   - Keep uncertainty unresolved and do not add tidy conclusions or claims.
   - Use common conversational English and contractions where appropriate; avoid calques, invented idioms, excessive polish, and AI-sounding copy.
   - Preserve source paragraph structure and existing English that already works; minimally correct only genuinely broken English.
   - Do not copy accidental Russian typos into English.
   - Flag ambiguous/slipped source phrases, coined expressions, regional or dated idioms, memes, song references, and culture-specific material rather than guessing.
   - Do not add emojis, exclamation marks, parentheses, or internet language absent from the source.

## Implementation sequence

### Phase 1: Preserve the rules and prepare translations

**New file:** `guidelines/TranslationGuidelines.md`

- Add the attachment exactly as supplied, with no editorial rewriting.
- The existing `AGENTS.md` already requires reading `guidelines/Guidelines.md`; add a concise pointer from `guidelines/Guidelines.md` to `guidelines/TranslationGuidelines.md` for any RU → EN editorial adaptation work. Do not replace the existing general guidelines template.

**Translation working pass (no data integration yet):**

- Extract the 30 current Russian `description` strings from `src/app/data/videos.ts` without modifying them.
- Draft one English adaptation per video ID, following the durable guideline.
- Preserve paragraph breaks, quoted English passages, URLs, names, profanity level, and deliberate repeated devices.
- Run a second editorial pass specifically for calques, over-polished phrasing, changed certainty, invented conclusions, accidental AI register, and punctuation drift.
- Build a short review list containing **only** items that the rules require the user to decide. Each item must include:
  - video ID/title;
  - the relevant Russian excerpt;
  - why it is ambiguous or culturally specific, written briefly in Russian;
  - two or three concrete English options where the rules call for options;
  - a recommended option when one is defensible.
- Keep unflagged completed adaptations out of the review list.
- Present the review list to the user and pause for answers before placing English text in production data.
- Keep draft translations and review notes in session or temporary working files, not new repository documentation.

### Phase 2: Integrate approved bilingual caption data

**File:** `src/app/data/videos.ts`

- After the user resolves all flagged items, replace `description?: string` with:
  - `descriptions?: { en: string; ru: string }`
  - The whole object remains optional for genuinely captionless future videos.
  - Both language keys are mandatory whenever a caption exists, preventing cross-language fallback and incomplete caption imports.
- Move each existing description into `descriptions.ru` **byte-for-byte/character-for-character**, without normalization or rewriting.
- Add the final reviewed adaptation to `descriptions.en` for all 30 records.
- Do not translate or otherwise alter titles, artist names, tags, credits, URLs, decades, IDs, or other video metadata.
- Use a dependency-neutral language type module if a shared `Language = "en" | "ru"` type is needed by both data and React code; avoid importing a React context module into the data file.

### Phase 3: Add global caption-language state

**New file:** `src/app/contexts/LanguageContext.tsx`

- Define or import the closed `Language` union `"en" | "ru"`.
- Provide a `LanguageProvider` and `useLanguage()` hook exposing the selected language and setter.
- Initialize synchronously from a namespaced key such as `dazed-and-amazed:caption-language` to avoid a post-render language flash.
- Accept only `en` or `ru`; default to `en` on first visit, invalid data, unavailable storage, or storage read errors.
- Persist changes, handling blocked/unavailable storage without breaking rendering.
- Keep this narrower than a full i18n framework because there is no translated interface copy or locale-aware routing.

**File:** `src/app/App.tsx`

- Wrap `RouterProvider` in `LanguageProvider` so the header and all routed detail pages share one state across navigation.

### Phase 4: Add the accessible `en / ru` control

**New file:** `src/app/components/LanguageToggle.tsx`

- Build it from the existing local `ToggleGroup` and `ToggleGroupItem` primitives as a required single-selection group.
- Render compact lowercase labels `en` and `ru`.
- Add an accessible group label such as “Caption language,” preserve the primitive’s selection semantics, and ignore an empty `onValueChange` so one language is always selected.
- Match the established editorial styling: subtle unselected border/treatment and `#D9E800` with black text for the selected option, consistent with active header navigation.
- Keep mobile touch targets usable; do not add another component library or icon.

### Phase 5: Make the header responsive with a mobile hamburger

**File:** `src/app/components/Root.tsx`

- Define the five current navigation destinations (Browse, Random Inspo, Random Thought, Submit, About) once in a local configuration so desktop and mobile labels, icons, routes, and active-state rules cannot drift.
- Desktop (`sm` and above):
  - Preserve the logo and full navigation.
  - Place `LanguageToggle` after navigation at the far right.
- Mobile (below `sm`):
  - Keep the logo on the left.
  - Put a hamburger trigger immediately left of `LanguageToggle`, leaving the language control at the far-right edge.
  - Use the existing local `Button` primitive and Lucide `Menu` icon with an accessible name.
  - Use the existing Radix-backed `Sheet` primitives for a right-side panel rather than custom overlay/focus code.
  - Include an accessible sheet title and description (visually hidden if appropriate), all five destinations as large vertical links, the existing yellow active state, and automatic close when a destination is chosen.
- Preserve sticky positioning, `#212121` header color, iOS safe-area top padding, logo behavior, and keyboard/focus accessibility.
- Do not duplicate the language toggle inside the sheet.

### Phase 6: Apply caption display rules

**File:** `src/app/components/VideoCard.tsx`

- Remove the description block entirely so Browse never renders captions.
- Preserve thumbnails, title, artist, sharing, all three tag rows, filtering, and spacing.
- This removal and the detail background change may already exist as partial uncommitted work from the planning session; inspect and preserve them rather than duplicating or reverting them.

**File:** `src/app/components/VideoDetail.tsx`

- Read the selected language through `useLanguage()`.
- Select only `video.descriptions?.[language]`; never fall back to the other language.
- Render the panel only when the selected value is non-empty.
- Add `lang={language}` to the caption element/container for assistive technology.
- Use `#212121` rather than `#0a0a0a` for the caption panel while retaining its border, padding, text contrast, and layout.
- Ensure source paragraph breaks remain visibly represented, using an appropriate whitespace treatment rather than flattening them into a single paragraph.
- This shared detail implementation covers Random Inspo and ordinary/direct detail navigation; do not add navigation-origin state.

## Edge cases and non-goals

- Random Inspo’s empty-archive behavior remains unchanged.
- Language is not added to the URL; shared video links remain stable and recipients use their own saved/default preference.
- Switching language updates the open caption immediately without reloading the video iframe or changing routes.
- Missing or malformed local-storage data never blocks rendering.
- Captioned records contain both translations. A genuinely captionless future record may omit `descriptions` and shows no panel in either language.
- Browse search continues not to search descriptions.
- Random Thought content is out of scope and is not translated by this toggle.
- All interface copy remains English.
- Do not create a committed translation-review report or draft file; only the durable rules belong in repository documentation.

## Verification

### Translation and data integrity

- Confirm all 30 videos retain IDs and all non-caption metadata.
- Confirm every former `description` becomes non-empty `descriptions.ru` and `descriptions.en`.
- Compare extracted pre-change Russian strings against final `descriptions.ru` values exactly; any mismatch fails verification.
- Confirm every flagged ambiguity/reference received a user decision and that the selected wording is applied.
- Re-read all English captions against `guidelines/TranslationGuidelines.md`, checking especially for calques, altered certainty, sanitized/escalated slang, invented wrap-ups, and accidental translation/AI register.
- Confirm no legacy `video.description` reads remain.

### Functional checks in the supervised dev server

- Browse at desktop and mobile widths: no editorial captions appear; metadata and infinite scroll remain intact.
- On a clean first visit, direct video detail shows English.
- Selecting `ru` immediately shows the exact Russian source; selecting `en` restores English.
- Reload and navigate among Browse, Random Inspo, and several detail pages: selection persists.
- Captions preserve paragraph breaks and use `#212121` after both direct/Browse and Random Inspo navigation.
- Mobile header fits without horizontal overflow; logo, hamburger, and far-right language control remain visible. The sheet contains all five links, traps/restores focus through Radix, reflects the active route, and closes on navigation.
- Desktop keeps all five links and places the language control at the far right.
- Sticky and iOS safe-area header behavior remain intact.

### Repository checks

- Run `pnpm format <changed files>` on every changed TypeScript/TSX/Markdown file supported by the formatter.
- Run `pnpm build` because this changes shared types, context wiring, header UI, and all video records.
- Treat any nonzero command as a failure. Report the existing Vite chunk-size warning separately if it remains non-blocking.

## Expected file set

- Add `guidelines/TranslationGuidelines.md`
- Modify `guidelines/Guidelines.md` with a pointer to the translation rules
- Modify `src/app/App.tsx`
- Modify `src/app/components/Root.tsx`
- Modify `src/app/components/VideoCard.tsx`
- Modify `src/app/components/VideoDetail.tsx`
- Modify `src/app/data/videos.ts`
- Add `src/app/components/LanguageToggle.tsx`
- Add `src/app/contexts/LanguageContext.tsx`
- Optionally add one tiny dependency-neutral language type module if needed to avoid data-to-React coupling
- Do not modify local/generated primitives under `src/app/components/ui/`
