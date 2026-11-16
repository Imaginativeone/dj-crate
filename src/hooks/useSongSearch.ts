"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Song, SongPage, SongQuery } from "@/lib/types";

/**
 * Fetches search results from /api/songs, one page at a time.
 *
 * Three classic data-fetching problems are handled here:
 *  1. Race conditions: a slow response for "be" must not overwrite a fast
 *     response for "beatles". Each request is cancelled (AbortController)
 *     when the query changes, and every result is tagged with its query key.
 *  2. Loading state without extra renders: "loading" is not stored. It is
 *     DERIVED: if the results we hold are for a different key than the one
 *     being asked for, we are loading.
 *  3. Errors: kept in state so the UI can show a message and a retry.
 */

type State = {
  /** The query these results belong to. Null before the first response. */
  key: string | null;
  items: Song[];
  total: number;
  nextOffset: number | null;
  error: string | null;
};

type Action =
  | { type: "loaded"; key: string; page: SongPage }
  | { type: "appended"; key: string; page: SongPage }
  | { type: "failed"; key: string; message: string };

const initialState: State = { key: null, items: [], total: 0, nextOffset: null, error: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loaded":
      return { key: action.key, ...action.page, error: null };
    case "appended":
      // A page for an old query arrived late. Ignore it.
      if (action.key !== state.key) return state;
      return {
        ...state,
        items: [...state.items, ...action.page.items],
        nextOffset: action.page.nextOffset,
      };
    case "failed":
      return { ...initialState, key: action.key, error: action.message };
  }
}

export function buildSearchUrl(query: SongQuery, offset: number): string {
  const params = new URLSearchParams({ q: query.q, sort: query.sort, offset: String(offset) });
  if (query.decade !== null) params.set("decade", String(query.decade));
  if (query.numberOnesOnly) params.set("ones", "1");
  return `/api/songs?${params}`;
}

async function fetchPage(query: SongQuery, offset: number, signal?: AbortSignal): Promise<SongPage> {
  const response = await fetch(buildSearchUrl(query, offset), { signal });
  if (!response.ok) throw new Error(`Search failed (${response.status})`);
  return (await response.json()) as SongPage;
}

export function useSongSearch(query: SongQuery, attempt = 0) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { q, decade, numberOnesOnly, sort } = query;
  // `attempt` is part of the key so "Try again" forces a fresh request.
  const key = JSON.stringify([q, decade, numberOnesOnly, sort, attempt]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPage({ q, decade, numberOnesOnly, sort }, 0, controller.signal)
      .then((page) => dispatch({ type: "loaded", key, page }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return; // we cancelled it on purpose
        dispatch({ type: "failed", key, message: (error as Error).message });
      });
    // Cleanup runs before the next effect and on unmount.
    return () => controller.abort();
  }, [key, q, decade, numberOnesOnly, sort]);

  // A ref, not state: it must change instantly and must not cause a render.
  const loadingMoreRef = useRef(false);
  const { key: loadedKey, nextOffset } = state;

  const loadMore = useCallback(() => {
    if (loadingMoreRef.current || nextOffset === null || loadedKey !== key) return;
    loadingMoreRef.current = true;
    fetchPage({ q, decade, numberOnesOnly, sort }, nextOffset)
      .then((page) => dispatch({ type: "appended", key, page }))
      .catch(() => {
        // Leave the list as it is; scrolling again will retry.
      })
      .finally(() => {
        loadingMoreRef.current = false;
      });
  }, [key, loadedKey, nextOffset, q, decade, numberOnesOnly, sort]);

  return {
    items: state.items,
    total: state.total,
    hasMore: state.nextOffset !== null,
    error: state.key === key ? state.error : null,
    isLoading: state.key !== key,
    /** Changes when a new result set arrives. Handy as a React `key`. */
    resultKey: state.key ?? "initial",
    loadMore,
  };
}
