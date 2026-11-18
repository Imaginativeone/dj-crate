# DJ Crate

Search every song that has charted in the U.S. since 1940 (39,017 of them), drop
songs into a crate, reorder them into a setlist, and run a demo checkout.

Built as interview practice for senior React / Next.js topics. Read
[STUDY_GUIDE.md](./STUDY_GUIDE.md) for what each file teaches.

**This is a demo.** There are no prices, nothing is sold, and no payment
details are collected. Song lengths are made up (see below).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 56 tests: Jest + React Testing Library + jest-axe
npm run lint
npm run build
```

Requires Node 20.9 or newer.

## What is where

| Path | What it is |
|---|---|
| `data/songs.json` | The song list. Read only on the server. |
| `src/lib/search.ts` | Pure search / filter / sort / paging function |
| `src/app/api/songs/route.ts` | Route Handler: `GET /api/songs` (search) |
| `src/app/api/songs/[id]/route.ts` | Dynamic route: `GET /api/songs/12141`, one song or 404 |
| `src/app/api/decades/route.ts` | `GET /api/decades`, counts per decade, prerendered at build |
| `src/lib/lookups.ts` | Pure lookups behind those two routes (the future database queries) |
| `src/hooks/useSongSearch.ts` | Client data fetching: cancel, race-proofing, paging, errors |
| `src/hooks/useDebouncedValue.ts` | Debounce (and a tidy closure example) |
| `src/components/SongResults.tsx` | Hand-rolled virtualized list |
| `src/cart/cartReducer.ts` | All crate rules as one pure reducer |
| `src/cart/CartContext.tsx` | Context + useReducer, split state/dispatch, localStorage |
| `src/alternatives/cartStore.zustand.ts` | Same crate as a Zustand store, for comparison |
| `src/app/checkout/actions.ts` | Server Action that re-checks the order on the server |
| `src/components/SiteStats.tsx` | Server Component with `"use cache"` |

## Song data

- Aug 1958 onward: every Billboard Hot 100 entry, from
  [mhollingshead/billboard-hot-100](https://github.com/mhollingshead/billboard-hot-100).
- 1940 to mid-1958: Billboard's earlier best-seller, jukebox and disc-jockey
  charts as compiled in the community "Whitburn Project" spreadsheet, via
  [Grimi94/data-science-music](https://github.com/Grimi94/data-science-music).

Neither archive has been checked against Billboard's own records.

**Song lengths are invented.** Neither archive records how long a song is, so
`src/lib/duration.ts` gives each song a believable length for its era (about
2:15 to 3:15 in the 1940s and 50s, up to 4:45 from the 1970s on). The length is
computed from the song's id, so a song always gets the same one.

## Replay the build with Gitlogue

[Gitlogue](https://github.com/unhappychoice/gitlogue) replays each commit in
the terminal as if someone were typing the code by hand.

```bash
npm run replay                          # every commit, oldest first
npm run replay -- --commit HEAD~3..HEAD # just the last three
```

Install it once by downloading the binary for your machine from its
[releases page](https://github.com/unhappychoice/gitlogue/releases) into a
folder on your PATH (or `brew install gitlogue` / `cargo install gitlogue`).
The script skips `data/songs.json` and `package-lock.json`, which are too big
to watch being typed.
