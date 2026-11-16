import { testSongs } from "@/lib/testSongs";
import { cartReducer, initialCartState, type CartState } from "./cartReducer";

const [a, b, c] = testSongs;
const withThree: CartState = { items: [a, b, c], hydrated: true };
const ids = (state: CartState) => state.items.map((s) => s.id);

describe("cartReducer", () => {
  it("adds a song to the end", () => {
    const next = cartReducer(initialCartState, { type: "added", song: a });
    expect(ids(next)).toEqual([a.id]);
  });

  it("does not add the same song twice", () => {
    const next = cartReducer(withThree, { type: "added", song: a });
    // Same object back = "nothing changed", so React skips the re-render.
    expect(next).toBe(withThree);
  });

  it("never mutates the previous state", () => {
    const before = [...withThree.items];
    cartReducer(withThree, { type: "moved", id: a.id, direction: "down" });
    cartReducer(withThree, { type: "removed", id: b.id });
    expect(withThree.items).toEqual(before);
  });

  it("removes a song", () => {
    expect(ids(cartReducer(withThree, { type: "removed", id: b.id }))).toEqual([a.id, c.id]);
  });

  it("moves a song up and down", () => {
    expect(ids(cartReducer(withThree, { type: "moved", id: c.id, direction: "up" }))).toEqual([
      a.id,
      c.id,
      b.id,
    ]);
    expect(ids(cartReducer(withThree, { type: "moved", id: a.id, direction: "down" }))).toEqual([
      b.id,
      a.id,
      c.id,
    ]);
  });

  it("ignores moves past either end", () => {
    expect(cartReducer(withThree, { type: "moved", id: a.id, direction: "up" })).toBe(withThree);
    expect(cartReducer(withThree, { type: "moved", id: c.id, direction: "down" })).toBe(withThree);
  });

  it("clears and hydrates", () => {
    expect(cartReducer(withThree, { type: "cleared" }).items).toEqual([]);
    expect(cartReducer(initialCartState, { type: "hydrated", items: [a] })).toEqual({
      items: [a],
      hydrated: true,
    });
  });
});
