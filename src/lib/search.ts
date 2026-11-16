import type { Song, SongPage, SongQuery } from "./types";

/**
 * Pure search over an in-memory song list.
 *
 * "Pure" means: same inputs -> same output, and nothing outside the function
 * is changed. That is what makes it trivial to unit test (see search.test.ts).
 */

// Lower-cased "title + artist" text per song, built once per song array.
// A WeakMap lets the cache disappear automatically if the array is discarded.
const haystackCache = new WeakMap<readonly Song[], string[]>();

function haystacksFor(songs: readonly Song[]): string[] {
  let haystacks = haystackCache.get(songs);
  if (!haystacks) {
    haystacks = songs.map((s) => `${s.title}\n${s.artist}`.toLowerCase());
    haystackCache.set(songs, haystacks);
  }
  return haystacks;
}

const byChart = (a: Song, b: Song) =>
  (a.peak ?? 999) - (b.peak ?? 999) ||
  (b.weeks ?? 0) - (a.weeks ?? 0) ||
  a.year - b.year;

const comparators: Record<SongQuery["sort"], (a: Song, b: Song) => number> = {
  chart: byChart,
  year: (a, b) => a.year - b.year || byChart(a, b),
  title: (a, b) => a.title.localeCompare(b.title) || a.year - b.year,
};

export function searchSongs(
  songs: readonly Song[],
  query: SongQuery,
  offset = 0,
  limit = 100,
): SongPage {
  const haystacks = haystacksFor(songs);
  // Every word typed must appear somewhere in the title or artist.
  const words = query.q.toLowerCase().split(/\s+/).filter(Boolean);

  const matches: Song[] = [];
  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    if (query.decade !== null && Math.floor(song.year / 10) * 10 !== query.decade) continue;
    if (query.numberOnesOnly && song.peak !== 1) continue;
    if (!words.every((word) => haystacks[i].includes(word))) continue;
    matches.push(song);
  }

  matches.sort(comparators[query.sort]);

  const items = matches.slice(offset, offset + limit);
  const nextOffset = offset + items.length < matches.length ? offset + items.length : null;
  return { total: matches.length, items, nextOffset };
}
