# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

DJ Crate is a Next.js 16 / React 19 app for interview practice on senior React topics. You search about 39,000 U.S. charting songs (1940 onward), add songs to a crate, reorder them into a setlist, and run a demo checkout. **It is a demo with no prices.** Nothing is sold and no payment details are collected. Keep it that way (see commit 436efd7).

The code is also teaching material. `STUDY_GUIDE.md` maps each file to an interview topic, and source files carry long explanatory comments. When you change a file the guide refers to, update the guide and the comments too, including test counts such as "32 tests" in README and STUDY_GUIDE. Write comments in the same plain, explanatory style.

## Commands

```bash
npm run dev                       # http://localhost:3000
npm test                          # Jest + React Testing Library + jest-axe (jsdom)
npx jest src/lib/search.test.ts   # one test file
npx jest -t "shows the saved crate"   # tests whose name matches
npm run lint
npm run build
./scripts/gource-video.sh [--real]    # Gource video of git history (needs gource + ffmpeg)
```

Requires Node 20.9+. Tests sit next to the code they cover (`*.test.ts(x)`). `@/` maps to `src/` in both tsconfig and `jest.config.ts`.

## Architecture

**Song data never reaches the browser in full.** `data/songs.json` (about 2 MB) is a compact array of `[year, title, artist, peak, weeks]` rows. `src/lib/songData.ts` loads it once per server process. A song's `id` is its index in that array. Only server code may import `songData.ts`: the Route Handler, the Server Action, and the `SiteStats` Server Component. Importing it from a `"use client"` file would ship the data to the browser.

**Search flow:** `SearchPanel` → `useDebouncedValue` → `useSongSearch` (a client hook built on a reducer, AbortController, and results tagged with their query key so late responses are ignored; loading state is derived, not stored) → `GET /api/songs` (`src/app/api/songs/route.ts` validates every URL parameter and caps `limit` at 100) → `searchSongs` in `src/lib/search.ts`, a pure function with a WeakMap haystack cache. Results are drawn by `SongResults`, a hand-rolled virtualized list that relies on a fixed `ROW_HEIGHT` of 56. `SongRow` is wrapped in `memo`, so callbacks passed to it must stay stable.

**Crate state:** every rule lives in the pure reducer `src/cart/cartReducer.ts`. `CartContext.tsx` wraps it in two contexts on purpose, state and dispatch, so components that only dispatch don't re-render. The crate is saved to localStorage under `dj-crate:v1`, but only after a `hydrated` action that runs after the first render. That avoids hydration mismatches and stops the empty starting state from overwriting the saved crate. `CartProvider` wraps everything in `src/app/layout.tsx`. `src/alternatives/cartStore.zustand.ts` is the same crate as a Zustand store, kept for comparison. Nothing in the app uses it.

**Checkout:** `CheckoutForm` posts to the Server Action `placeOrder` in `src/app/checkout/actions.ts`. The browser sends only song IDs, and the server checks each one against the real list. `validation.ts` is shared and pure.

**Next.js config** (`next.config.ts`): `cacheComponents` and `partialPrefetching` are on, which is why `SiteStats` uses `"use cache"`. `outputFileTracingIncludes` lists `data/songs.json` because `songData.ts` builds the file path at runtime, and on Vercel the data file is otherwise missing from deployed functions. Keep that entry if you move or rename the data file.

## Testing conventions

- Use `testSongs` from `src/lib/testSongs.ts` as the small, predictable fixture.
- Component tests render inside a real `<CartProvider>`, seed localStorage with `STORAGE_KEY`, query by role and accessible name, and check accessibility with `axe` (`toHaveNoViolations` is registered in `jest.setup.ts`).
- Mock only the edges (fetch, timers, storage), never the app's own components.
