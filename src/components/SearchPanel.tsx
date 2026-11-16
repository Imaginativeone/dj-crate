"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSongSearch } from "@/hooks/useSongSearch";
import type { SortKey } from "@/lib/types";
import { SongResults } from "./SongResults";

const DECADES = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

export function SearchPanel() {
  // Controlled inputs: React state is the single source of truth for each field.
  const [text, setText] = useState("");
  const [decade, setDecade] = useState<number | null>(null);
  const [numberOnesOnly, setNumberOnesOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("chart");
  const [attempt, setAttempt] = useState(0);

  // The input updates on every keystroke; the search waits for a pause.
  const q = useDebouncedValue(text.trim(), 250);
  const search = useSongSearch({ q, decade, numberOnesOnly, sort }, attempt);

  const status = search.error
    ? ""
    : search.isLoading
      ? "Searching…"
      : `${search.total.toLocaleString()} ${search.total === 1 ? "song" : "songs"}`;

  return (
    <section aria-labelledby="search-heading">
      <h2 id="search-heading" className="visually-hidden">
        Search songs
      </h2>

      {/* role="search" makes this a landmark screen-reader users can jump to. */}
      <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="field field-grow">
          <label htmlFor="q">Song or artist</label>
          <input
            id="q"
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Try “respect” or “prince”"
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="decade">Decade</label>
          <select
            id="decade"
            value={decade ?? ""}
            onChange={(e) => setDecade(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All years</option>
            {DECADES.map((d) => (
              <option key={d} value={d}>
                {d}s
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sort">Sort by</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="chart">Biggest hits</option>
            <option value="year">Year</option>
            <option value="title">Title</option>
          </select>
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={numberOnesOnly}
            onChange={(e) => setNumberOnesOnly(e.target.checked)}
          />
          #1 hits only
        </label>
      </form>

      {/* A polite live region: screen readers announce the count when it changes. */}
      <p className="status" role="status" aria-live="polite">
        {status}
      </p>

      {search.error ? (
        <div className="error" role="alert">
          <p>Could not load songs: {search.error}</p>
          <button type="button" className="button" onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </button>
        </div>
      ) : (
        <div className={search.isLoading ? "is-stale" : undefined} aria-busy={search.isLoading}>
          {/*
            key={resultKey}: when a NEW result set arrives React throws away
            the old list component and mounts a fresh one, which resets its
            scroll position state for free. No effect needed.
          */}
          {search.resultKey !== "initial" && (
            <SongResults
              key={search.resultKey}
              items={search.items}
              total={search.total}
              hasMore={search.hasMore}
              onLoadMore={search.loadMore}
            />
          )}
        </div>
      )}
    </section>
  );
}
