import type { Song } from "./types";

/**
 * Pure helpers behind the small API routes. They take the song list as an
 * argument instead of loading it, so tests can pass in a tiny list.
 *
 * When the songs move into a database, these become queries, roughly:
 *   findSong      -> SELECT * FROM songs WHERE id = $1
 *   countByDecade -> SELECT year / 10 * 10 AS decade, COUNT(*) ... GROUP BY decade
 * and the routes, plus every fetch() that calls them, stay the same.
 */

/**
 * Finds a song from the `[id]` part of a URL, which is always a string and
 * may be anything a visitor typed. Only plain digits are accepted, so
 * "12", "-1", "1e3", "0x10" and "abc" can't sneak through Number().
 */
export function findSong(songs: readonly Song[], rawId: string): Song | null {
  if (!/^\d{1,9}$/.test(rawId)) return null;
  return songs[Number(rawId)] ?? null;
}

export type DecadeCount = { decade: number; songs: number; numberOnes: number };

/** One entry per decade, oldest first, with how many songs and number ones it has. */
export function countByDecade(songs: readonly Song[]): DecadeCount[] {
  const byDecade = new Map<number, DecadeCount>();
  for (const song of songs) {
    const decade = Math.floor(song.year / 10) * 10;
    const entry = byDecade.get(decade) ?? { decade, songs: 0, numberOnes: 0 };
    entry.songs += 1;
    if (song.peak === 1) entry.numberOnes += 1;
    byDecade.set(decade, entry);
  }
  return [...byDecade.values()].sort((a, b) => a.decade - b.decade);
}
