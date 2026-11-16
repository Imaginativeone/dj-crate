import { readFileSync } from "node:fs";
import path from "node:path";
import type { Song } from "./types";

/**
 * SERVER ONLY. Loads the 39,000-song list from disk once and keeps it in
 * memory. Nothing in a "use client" file may import this module, which is how
 * the 2 MB data file stays out of the browser bundle.
 */

type Row = [year: number, title: string, artist: string, peak: number | null, weeks: number | null];

let songs: Song[] | null = null;

export function getSongs(): Song[] {
  if (!songs) {
    const file = path.join(process.cwd(), "data", "songs.json");
    const rows = JSON.parse(readFileSync(file, "utf8")) as Row[];
    songs = rows.map(([year, title, artist, peak, weeks], id) => ({
      id,
      year,
      title,
      artist,
      peak,
      weeks,
    }));
  }
  return songs;
}
