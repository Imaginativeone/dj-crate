"use client";

import { memo, type CSSProperties } from "react";
import type { Song } from "@/lib/types";

type Props = {
  song: Song;
  inCrate: boolean;
  /** Must be a stable function (see useCallback in SongResults) or memo is useless. */
  onToggle: (song: Song, inCrate: boolean) => void;
  position: number;
  setSize: number;
  style: CSSProperties;
};

/**
 * memo() = "skip re-rendering me if my props are the same as last time".
 * Adding one song to the crate changes `inCrate` for one row, so one row
 * re-renders instead of every visible row.
 */
export const SongRow = memo(function SongRow({
  song,
  inCrate,
  onToggle,
  position,
  setSize,
  style,
}: Props) {
  return (
    <li className="song-row" style={style} aria-posinset={position} aria-setsize={setSize}>
      <span className="song-year">{song.year}</span>
      <span className="song-main">
        <span className="song-title">{song.title}</span>
        <span className="song-artist">{song.artist}</span>
      </span>
      <span className={song.peak === 1 ? "song-peak is-number-one" : "song-peak"}>
        {/* The visible text is terse; screen readers get the full sentence. */}
        <span aria-hidden="true">{song.peak === null ? "–" : `#${song.peak}`}</span>
        <span className="visually-hidden">
          {song.peak === null ? "Peak position unknown" : `Peaked at number ${song.peak}`}
        </span>
      </span>
      <button
        type="button"
        className={inCrate ? "button is-active" : "button"}
        aria-pressed={inCrate}
        aria-label={`${inCrate ? "Remove" : "Add"} ${song.title} by ${song.artist} ${
          inCrate ? "from" : "to"
        } crate`}
        onClick={() => onToggle(song, inCrate)}
      >
        {inCrate ? "In crate" : "Add"}
      </button>
    </li>
  );
});
