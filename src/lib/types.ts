/** One charting song. `id` is its position in data/songs.json. */
export type Song = {
  id: number;
  year: number;
  title: string;
  artist: string;
  /** Highest chart position reached (1 = number one). Null if unknown. */
  peak: number | null;
  /** Total weeks on the chart. Null if unknown. */
  weeks: number | null;
  /** Length in seconds. MADE UP, not real: see src/lib/duration.ts. */
  durationSec: number;
};

export type SortKey = "chart" | "year" | "title";

export type SongQuery = {
  q: string;
  /** First year of a decade (1940, 1950, ...) or null for all years. */
  decade: number | null;
  numberOnesOnly: boolean;
  sort: SortKey;
};

export type SongPage = {
  total: number;
  items: Song[];
  /** Offset to request next, or null when there are no more results. */
  nextOffset: number | null;
};
