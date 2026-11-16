import type { Song } from "@/lib/types";

/**
 * All the rules for how the crate can change, in one pure function.
 *
 * A reducer takes (current state, action) and RETURNS A NEW state. It never
 * edits the old one. React decides whether to re-render by asking "is this
 * the same object as before?", so mutating in place would hide the change.
 */

export type CartState = {
  items: Song[];
  /** False until we have read any saved crate from the browser. */
  hydrated: boolean;
};

export type CartAction =
  | { type: "added"; song: Song }
  | { type: "removed"; id: number }
  | { type: "moved"; id: number; direction: "up" | "down" }
  | { type: "cleared" }
  | { type: "hydrated"; items: Song[] };

export const initialCartState: CartState = { items: [], hydrated: false };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "added": {
      if (state.items.some((s) => s.id === action.song.id)) return state;
      return { ...state, items: [...state.items, action.song] };
    }
    case "removed": {
      const items = state.items.filter((s) => s.id !== action.id);
      return items.length === state.items.length ? state : { ...state, items };
    }
    case "moved": {
      const from = state.items.findIndex((s) => s.id === action.id);
      const to = action.direction === "up" ? from - 1 : from + 1;
      if (from === -1 || to < 0 || to >= state.items.length) return state;
      const items = [...state.items];
      [items[from], items[to]] = [items[to], items[from]];
      return { ...state, items };
    }
    case "cleared":
      return state.items.length === 0 ? state : { ...state, items: [] };
    case "hydrated":
      return { items: action.items, hydrated: true };
  }
}
