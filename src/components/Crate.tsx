"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, useCartDispatch } from "@/cart/CartContext";
import type { Song } from "@/lib/types";

export function setlistText(items: readonly Song[]): string {
  return items.map((s, i) => `${i + 1}. ${s.title} - ${s.artist} (${s.year})`).join("\n");
}

function downloadSetlist(items: readonly Song[]) {
  const url = URL.createObjectURL(new Blob([setlistText(items)], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "setlist.txt";
  link.click();
  URL.revokeObjectURL(url);
}

export function Crate() {
  const { items, hydrated } = useCart();
  const dispatch = useCartDispatch();
  // Text for screen readers after a reorder or removal, where nothing else
  // would tell a non-sighted user that the action worked.
  const [announcement, setAnnouncement] = useState("");

  if (!hydrated) return <p className="empty">Loading your crate…</p>;

  if (items.length === 0) {
    return (
      <div className="empty">
        <p>Your crate is empty.</p>
        <Link href="/" className="button">
          Find some songs
        </Link>
        <p className="visually-hidden" role="status">
          {announcement}
        </p>
      </div>
    );
  }

  function move(song: Song, index: number, direction: "up" | "down") {
    dispatch({ type: "moved", id: song.id, direction });
    const newPosition = direction === "up" ? index : index + 2;
    setAnnouncement(`${song.title} moved to position ${newPosition} of ${items.length}`);
  }

  function remove(song: Song) {
    dispatch({ type: "removed", id: song.id });
    setAnnouncement(`${song.title} removed from crate`);
  }

  return (
    <div className="crate">
      <ol className="crate-list">
        {items.map((song, index) => (
          <li key={song.id} className="crate-item">
            <span className="crate-position" aria-hidden="true">
              {index + 1}
            </span>
            <span className="song-main">
              <span className="song-title">{song.title}</span>
              <span className="song-artist">
                {song.artist} · {song.year}
              </span>
            </span>
            <span className="crate-actions">
              {/* Buttons instead of drag-and-drop: works with keyboard, switch
                  devices and screen readers with no extra library. */}
              <button
                type="button"
                className="button button-icon"
                disabled={index === 0}
                aria-label={`Move ${song.title} up`}
                onClick={() => move(song, index, "up")}
              >
                ↑
              </button>
              <button
                type="button"
                className="button button-icon"
                disabled={index === items.length - 1}
                aria-label={`Move ${song.title} down`}
                onClick={() => move(song, index, "down")}
              >
                ↓
              </button>
              <button
                type="button"
                className="button button-icon"
                aria-label={`Remove ${song.title} from crate`}
                onClick={() => remove(song)}
              >
                ✕
              </button>
            </span>
          </li>
        ))}
      </ol>

      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>

      <aside className="summary" aria-labelledby="summary-heading">
        <h2 id="summary-heading">Summary</h2>
        {/* Derived data: counted from state during render, never stored as state. */}
        <p className="summary-count">
          {items.length} {items.length === 1 ? "track" : "tracks"}
        </p>
        <Link href="/checkout" className="button is-primary">
          Check out
        </Link>
        <button type="button" className="button" onClick={() => downloadSetlist(items)}>
          Download setlist
        </button>
        <button type="button" className="button" onClick={() => dispatch({ type: "cleared" })}>
          Empty crate
        </button>
        <p className="hint">Demo only. Nothing is sold or sent.</p>
      </aside>
    </div>
  );
}
