import { songDuration } from "./duration";
import type { Song } from "./types";

/** A tiny, predictable song list for tests. */
export const testSongs: Song[] = (
  [
  { id: 0, year: 1942, title: "White Christmas", artist: "Bing Crosby", peak: 1, weeks: 15 },
  { id: 1, year: 1964, title: "I Want To Hold Your Hand", artist: "The Beatles", peak: 1, weeks: 15 },
  { id: 2, year: 1967, title: "Respect", artist: "Aretha Franklin", peak: 1, weeks: 12 },
  { id: 3, year: 1968, title: "Revolution", artist: "The Beatles", peak: 12, weeks: 11 },
  { id: 4, year: 1984, title: "When Doves Cry", artist: "Prince", peak: 1, weeks: 21 },
  { id: 5, year: 1984, title: "Let's Go Crazy", artist: "Prince And The Revolution", peak: 1, weeks: 19 },
  { id: 6, year: 1999, title: "Praise You", artist: "Fatboy Slim", peak: 36, weeks: 20 },
  ] satisfies Omit<Song, "durationSec">[]
).map((s) => ({ ...s, durationSec: songDuration(s.id, s.year) }));
