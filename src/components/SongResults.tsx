"use client";

import { useCallback, useMemo, useState, type UIEvent } from "react";
import { useCart, useCartDispatch } from "@/cart/CartContext";
import type { Song } from "@/lib/types";
import { SongRow } from "./SongRow";

export const ROW_HEIGHT = 56;
export const VIEWPORT_HEIGHT = 560;
const OVERSCAN = 6; // extra rows above and below, so fast scrolling shows no gaps

type Props = {
  items: Song[];
  total: number;
  hasMore: boolean;
  onLoadMore: () => void;
};

/**
 * A hand-rolled "virtualized" (windowed) list.
 *
 * Thousands of results may be loaded, but only the ~20 rows that fit in the
 * scroll box exist in the DOM. A tall empty spacer gives the scrollbar the
 * right length, and each rendered row is positioned by its index. Libraries
 * such as TanStack Virtual and react-window do exactly this, plus support
 * for rows of different heights.
 */
export function SongResults({ items, total, hasMore, onLoadMore }: Props) {
  const [scrollTop, setScrollTop] = useState(0);
  const { items: crate } = useCart();
  const dispatch = useCartDispatch();

  // A Set answers "is this song in the crate?" instantly. Rebuilt only when
  // the crate changes, not on every scroll event.
  const crateIds = useMemo(() => new Set(crate.map((s) => s.id)), [crate]);

  // useCallback keeps this the SAME function between renders. Without it
  // every row would get a "new" onToggle prop each render and memo() in
  // SongRow would never be able to skip.
  const handleToggle = useCallback(
    (song: Song, inCrate: boolean) => {
      dispatch(inCrate ? { type: "removed", id: song.id } : { type: "added", song });
    },
    [dispatch],
  );

  const first = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const last = Math.min(
    items.length,
    Math.ceil((scrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) + OVERSCAN,
  );

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const top = event.currentTarget.scrollTop;
    setScrollTop(top);
    // Near the end of what is loaded? Ask for the next page.
    const lastVisible = Math.ceil((top + VIEWPORT_HEIGHT) / ROW_HEIGHT);
    if (hasMore && lastVisible >= items.length - 20) onLoadMore();
  }

  if (items.length === 0) {
    return <p className="empty">No songs match. Try fewer words or a different decade.</p>;
  }

  return (
    <div
      className="results"
      style={{ height: VIEWPORT_HEIGHT }}
      onScroll={handleScroll}
      // Scrollable regions must be reachable by keyboard (WCAG 2.1.1).
      tabIndex={0}
      role="region"
      aria-label={`Search results, ${total.toLocaleString()} songs`}
    >
      <ul className="results-list" style={{ height: items.length * ROW_HEIGHT }}>
        {items.slice(first, last).map((song, i) => (
          <SongRow
            key={song.id}
            song={song}
            inCrate={crateIds.has(song.id)}
            onToggle={handleToggle}
            position={first + i + 1}
            setSize={total}
            style={{ transform: `translateY(${(first + i) * ROW_HEIGHT}px)`, height: ROW_HEIGHT }}
          />
        ))}
      </ul>
    </div>
  );
}
