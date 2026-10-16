# Set the Global Page Background to `#212121`

## Goal

Make the visible background canvas on every application page use `#212121` (`rgb(33, 33, 33)`) while preserving intentional darker surfaces such as form fields, cards, dropdowns, and the video player.

## Repository Findings

- `src/styles/theme.css` already gives the `<body>` an explicit `rgb(33, 33, 33)` background.
- `src/app/components/Root.tsx` wraps every route in `min-h-screen bg-black`, which currently obscures the body background.
- The sticky header in `Root.tsx` uses `bg-black/95`, so it also remains black rather than matching the requested global canvas.
- All routes render beneath `Root`, so changing the shared wrapper is sufficient for Home, Random Inspiration, Random Thought, Submit, Video Detail, and About.
- The archive is empty in the current source: `src/app/data/videos.ts` exports `videos: Video[] = []`. No video media files are tracked, and the only visible Git revision of that file is already empty. Archive restoration is explicitly out of scope for this change.

## Implementation

1. Update the shared app wrapper in `src/app/components/Root.tsx`:
   - Replace `bg-black` on the outer `min-h-screen` container with the exact Tailwind arbitrary color `bg-[#212121]`.
   - Keep `min-h-screen` and `text-white` unchanged.

2. Update the shared sticky header in `src/app/components/Root.tsx`:
   - Replace `bg-black/95` with an equivalent `#212121`-based background at the existing 95% opacity, using Tailwind’s arbitrary color/opacity syntax supported by the project (for example, `bg-[#212121]/95`).
   - Preserve the existing border, blur, positioning, safe-area padding, and stacking behavior.

3. Keep the body declaration in `src/styles/theme.css` at `rgb(33, 33, 33)`:
   - Do not change the shared `--background` design token, because it is also consumed by reusable UI components and changing it would broaden the visual impact beyond the page canvas.
   - Do not alter darker local surfaces (`#111111`, `#0a0a0a`, black video-player fallback), overlays, controls, cards, or menus.

4. Do not modify archive data or media files.

## Edge Cases and Behavior

- The outer wrapper remains `min-h-screen`, ensuring short pages still fill the viewport with `#212121`.
- Long pages inherit the same wrapper background for their full content height.
- The translucent sticky header remains visually distinct through its existing backdrop blur while using `#212121` as its base color.
- Route transitions and empty states continue to render within the same global background.

## Verification

- Review the scoped diff to confirm only the shared wrapper/header classes in `Root.tsx` change and the existing body color remains intact.
- In the existing hot-reloading preview, inspect representative routes:
  - `/` for the home/empty archive state.
  - `/thought` for a full-height content page.
  - `/submit` for a page containing intentionally darker form fields.
  - `/about` for a page containing an intentionally darker card.
- Confirm the viewport/page canvas and sticky header are `#212121` on all routes, while cards, inputs, menus, overlays, and video-specific surfaces retain their existing colors.
- No build or typecheck is necessary for this localized class-only styling change unless the preview shows a concrete failure.
