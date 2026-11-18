"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { songDuration } from "@/lib/duration";
import type { Song } from "@/lib/types";
import { cartReducer, initialCartState, type CartAction, type CartState } from "./cartReducer";

/**
 * Two contexts on purpose.
 *
 * `dispatch` from useReducer is the same function for the life of the
 * provider. Components that only SEND actions (an "Add" button) read the
 * dispatch context and never re-render when the crate changes. Components
 * that SHOW the crate read the state context and do re-render. With a single
 * combined context, every consumer would re-render on every change.
 */
const CartStateContext = createContext<CartState | null>(null);
const CartDispatchContext = createContext<Dispatch<CartAction> | null>(null);

export const STORAGE_KEY = "dj-crate:v1";

function readSavedItems(): Song[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // Crates saved before song lengths were added have no durationSec. The
    // length is computed from id and year, so we can fill in the exact value
    // the server would have sent instead of showing "NaN".
    return (parsed as Song[]).map((s) =>
      typeof s.durationSec === "number" ? s : { ...s, durationSec: songDuration(s.id, s.year) },
    );
  } catch {
    // Storage can be blocked (private mode) or hold bad JSON. Start empty.
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Load the saved crate AFTER the first render. The server has no access to
  // localStorage, so server HTML and the first browser render must both show
  // an empty crate or React reports a hydration mismatch.
  useEffect(() => {
    dispatch({ type: "hydrated", items: readSavedItems() });
  }, []);

  // Save on every change, but not before loading (or we would overwrite the
  // saved crate with the empty starting state).
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Ignore: the crate still works for this visit, it just is not saved.
    }
  }, [state.hydrated, state.items]);

  return (
    <CartStateContext value={state}>
      <CartDispatchContext value={dispatch}>{children}</CartDispatchContext>
    </CartStateContext>
  );
}

export function useCart(): CartState {
  const state = useContext(CartStateContext);
  if (!state) throw new Error("useCart must be used inside <CartProvider>");
  return state;
}

export function useCartDispatch(): Dispatch<CartAction> {
  const dispatch = useContext(CartDispatchContext);
  if (!dispatch) throw new Error("useCartDispatch must be used inside <CartProvider>");
  return dispatch;
}
