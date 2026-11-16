import { create } from "zustand";
import { cartReducer, type CartAction, type CartState } from "@/cart/cartReducer";

/**
 * NOT USED BY THE APP. A side-by-side comparison for interview prep.
 *
 * The same crate as a Zustand store, reusing the exact same reducer. The
 * differences from Context + useReducer:
 *   - No provider component. The store lives outside React.
 *   - Components subscribe to a SLICE: useCartStore((s) => s.items.length)
 *     re-renders only when that number changes. Context cannot do that, which
 *     is why CartContext.tsx splits state and dispatch into two contexts.
 */
type CartStore = CartState & { dispatch: (action: CartAction) => void };

export const useCartStore = create<CartStore>()((set) => ({
  items: [],
  hydrated: true,
  dispatch: (action) => set((state) => cartReducer(state, action)),
}));
