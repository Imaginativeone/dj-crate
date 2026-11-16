# DJ Crate

Search every song that has charted in the U.S. since 1940 (39,017 of them), drop
songs into a crate, reorder them into a setlist, and run a mock checkout.

Built as interview practice for senior React / Next.js topics. Read
[STUDY_GUIDE.md](./STUDY_GUIDE.md) for what each file teaches.

**This is a demo store.** Prices are invented, nothing is sold, and no payment
details are collected.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 36 tests: Jest + React Testing Library + jest-axe
npm run lint
npm run build
```

Requires Node 20.9 or newer.

## What is where

| Path | What it is |
|---|---|
| `data/songs.json` | The song list. Read only on the server. |
| `src/lib/search.ts` | Pure search / filter / sort / paging function |
| `src/app/api/songs/route.ts` | Route Handler: `GET /api/songs` |
| `src/hooks/useSongSearch.ts` | Client data fetching: cancel, race-proofing, paging, errors |
| `src/hooks/useDebouncedValue.ts` | Debounce (and a tidy closure example) |
| `src/components/SongResults.tsx` | Hand-rolled virtualized list |
| `src/cart/cartReducer.ts` | All crate rules as one pure reducer |
| `src/cart/CartContext.tsx` | Context + useReducer, split state/dispatch, localStorage |
| `src/alternatives/cartStore.zustand.ts` | Same crate as a Zustand store, for comparison |
| `src/app/checkout/actions.ts` | Server Action that re-prices the order on the server |
| `src/components/SiteStats.tsx` | Server Component with `"use cache"` |

## Song data

- Aug 1958 onward: every Billboard Hot 100 entry, from
  [mhollingshead/billboard-hot-100](https://github.com/mhollingshead/billboard-hot-100).
- 1940 to mid-1958: Billboard's earlier best-seller, jukebox and disc-jockey
  charts as compiled in the community "Whitburn Project" spreadsheet, via
  [Grimi94/data-science-music](https://github.com/Grimi94/data-science-music).

Neither archive has been checked against Billboard's own records.

## Gource video of the build

```bash
brew install gource ffmpeg      # macOS, one time
./scripts/gource-video.sh       # writes gource/dj-crate.mp4
```

By default the script spaces commits evenly (one per "day") in a throwaway log
file so each gets screen time. Run `./scripts/gource-video.sh --real` to use the
true commit times instead. The date banner is hidden because evenly spaced dates are not real dates. Your
git history is not modified either way.
